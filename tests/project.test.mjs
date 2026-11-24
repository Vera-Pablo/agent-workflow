import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GENERATED_NOTE, EXCLUDE_START, mergeExcludeBlock, removeExcludeBlock } from '../scripts/lib.mjs';
import { createDiskProbe, findForeignReason, planCommunitySkills, planProjectGroups } from '../scripts/project.mjs';
import { apply, revert } from '../scripts/actions.mjs';
import claude from '../adapters/claude.mjs';

const repoDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const installer = path.join(repoDir, 'scripts', 'install.mjs');
const missing = { kind: 'missing', tracked: false };

test('mergeExcludeBlock agrega un bloque administrado y conserva el contenido existente', () => {
  const next = mergeExcludeBlock('# propio\n*.tmp\n', ['/CLAUDE.local.md', '/.claude/agents/planner.md']);
  assert.ok(next.startsWith('# propio\n*.tmp\n'));
  assert.ok(next.includes(`${EXCLUDE_START}\n/CLAUDE.local.md\n/.claude/agents/planner.md\n`));
});

test('mergeExcludeBlock es idempotente y no duplica entradas que ya estaban fuera del bloque', () => {
  const once = mergeExcludeBlock('/CLAUDE.local.md\n', ['/CLAUDE.local.md', '/.claude/skills/sdd', '/.claude/skills/sdd']);
  assert.equal(mergeExcludeBlock(once, ['/CLAUDE.local.md', '/.claude/skills/sdd']), once);
  assert.equal(once.match(/\/CLAUDE\.local\.md/g).length, 1);
  assert.equal(once.match(/\/\.claude\/skills\/sdd/g).length, 1);
});

test('removeExcludeBlock deja solo el contenido ajeno', () => {
  const merged = mergeExcludeBlock('*.tmp\n', ['/CLAUDE.local.md']);
  assert.equal(removeExcludeBlock(merged), '*.tmp\n');
  assert.equal(removeExcludeBlock('*.tmp\n'), '*.tmp\n');
});

test('findForeignReason distingue destinos propios de ajenos', () => {
  const link = { type: 'link', path: '/p/.claude/skills/sdd', target: '/repo/skills/sdd' };
  assert.equal(findForeignReason(link, missing), null);
  assert.equal(findForeignReason(link, { kind: 'link', linkTarget: '/repo/skills/sdd', tracked: false }), null);
  assert.ok(findForeignReason(link, { kind: 'link', linkTarget: '/otro/sdd', tracked: false }));
  assert.ok(findForeignReason(link, { kind: 'dir', tracked: false }));

  const file = { type: 'file', path: '/p/.claude/agents/planner.md', content: 'x' };
  assert.equal(findForeignReason(file, { kind: 'file', content: `a\n${GENERATED_NOTE}\n`, tracked: false }), null);
  assert.ok(findForeignReason(file, { kind: 'file', content: 'mío', tracked: false }));

  const block = { type: 'block', path: '/p/CLAUDE.local.md', content: 'x' };
  assert.equal(findForeignReason(block, { kind: 'file', content: 'mío', tracked: false }), null);
  assert.ok(findForeignReason(block, { kind: 'dir', tracked: false }));
  assert.ok(findForeignReason(block, { kind: 'file', content: 'mío', tracked: true }));

  const json = { type: 'json-ensure', path: '/p/.claude/settings.local.json', ensure: {} };
  assert.equal(findForeignReason(json, { kind: 'file', content: '{}', tracked: false }), null);
  assert.ok(findForeignReason(json, { kind: 'file', content: '{roto', tracked: false }));
});

test('planProjectGroups omite ajenos y excluye solo las rutas propias', () => {
  const root = path.resolve('/p');
  const own = { type: 'block', path: path.join(root, 'CLAUDE.local.md'), content: 'x' };
  const foreign = { type: 'link', path: path.join(root, '.claude', 'skills', 'sdd'), target: path.resolve('/repo/skills/sdd') };
  const excludePath = path.join(root, '.git', 'info', 'exclude');
  const probe = (p) => (p === foreign.path ? { kind: 'dir', tracked: false } : missing);

  const [group, exclusion] = planProjectGroups([{ label: 'g', actions: [own, foreign] }], { root, excludePath, probe });

  assert.deepEqual(group.actions.map((a) => a.type), ['empty-dirs', 'block', 'skip']);
  assert.deepEqual(group.actions[0].paths, []);
  assert.equal(group.actions[2].path, foreign.path);
  assert.deepEqual(exclusion.actions, [{ type: 'exclude', path: excludePath, entries: ['/CLAUDE.local.md'], remaining: [] }]);
});

test('planProjectGroups reúne en una sola exclusión las rutas propias de todos los grupos', () => {
  const root = path.resolve('/p');
  const excludePath = path.join(root, '.git', 'info', 'exclude');
  const groups = [
    { label: 'a', actions: [{ type: 'block', path: path.join(root, 'CLAUDE.local.md'), content: 'x' }] },
    { label: 'b', actions: [{ type: 'file', path: path.join(root, '.bob', 'rules', 'x.md'), content: 'x' }] },
  ];

  const planned = planProjectGroups(groups, { root, excludePath, probe: () => missing });

  assert.equal(planned.length, 3);
  assert.deepEqual(planned[1].actions[0].paths, [path.join(root, '.bob', 'rules'), path.join(root, '.bob')]);
  const exclusions = planned.flatMap((g) => g.actions).filter((a) => a.type === 'exclude');
  assert.deepEqual(exclusions, [{ type: 'exclude', path: excludePath, entries: ['/CLAUDE.local.md', '/.bob/rules/x.md'], remaining: [] }]);
});

test('el adaptador de Claude en modo proyecto escribe solo bajo la raíz y referencia los roles del repo', () => {
  const root = path.resolve('/proyecto');
  const rolesDir = path.join(repoDir, 'roles');
  const ctx = {
    repoDir, root, scope: 'project', rolesDir, skills: ['sdd'], models: { claude: { cheap: 'haiku' } },
    roles: [{ name: 'implementer', mode: 'subagent', tier: 'cheap', description: 'd', body: 'b' }],
  };
  const actions = claude.plan(ctx);

  assert.deepEqual(actions.map((a) => path.relative(root, a.path)), [
    'CLAUDE.local.md',
    path.join('.claude', 'settings.local.json'),
    path.join('.claude', 'skills', 'sdd'),
    path.join('.claude', 'agents', 'implementer.md'),
  ]);
  assert.ok(actions[0].content.includes(`${rolesDir.replaceAll('\\', '/')}/coordinator.md`));
  assert.ok(actions[3].content.includes('model: haiku'));
});

function makeProject({ git = true } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aw-project-'));
  if (git) execFileSync('git', ['init', '-q', dir]);
  return dir;
}

function runInstaller(dir, ...flags) {
  const result = spawnSync(process.execPath, [installer, '--project', '--dir', dir, ...flags], { encoding: 'utf8' });
  return { code: result.status, out: result.stdout + result.stderr };
}

const read = (...parts) => fs.readFileSync(path.join(...parts), 'utf8');

test('--project aborta sin cambios si el directorio no es un repositorio git', (t) => {
  const dir = makeProject({ git: false });
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));

  const { code, out } = runInstaller(dir, '--apply');

  assert.equal(code, 1);
  assert.match(out, /\.git/);
  assert.deepEqual(fs.readdirSync(dir), []);
});

test('--project --apply instala dentro del proyecto, excluye lo creado y es idempotente', (t) => {
  const dir = makeProject();
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.writeFileSync(path.join(dir, 'CLAUDE.local.md'), 'nota propia\n');
  fs.mkdirSync(path.join(dir, '.claude'));
  fs.writeFileSync(path.join(dir, '.claude', 'settings.local.json'), JSON.stringify({ model: 'x', permissions: { allow: ['Read'] } }));

  assert.equal(runInstaller(dir, '--apply').code, 0);

  assert.match(read(dir, 'CLAUDE.local.md'), /nota propia/);
  assert.match(read(dir, 'CLAUDE.local.md'), /agent-workflow:start/);
  const settings = JSON.parse(read(dir, '.claude', 'settings.local.json'));
  assert.equal(settings.model, 'x');
  assert.deepEqual(settings.permissions.allow, ['Read']);
  assert.deepEqual(settings.permissions.ask, ['Bash(git commit:*)', 'Bash(git push:*)']);
  assert.ok(fs.lstatSync(path.join(dir, '.claude', 'skills', 'sdd')).isSymbolicLink());
  assert.equal(fs.existsSync(path.join(dir, '.claude', 'skills', 'init-workflow')), false);
  assert.match(read(dir, '.claude', 'agents', 'implementer.md'), /model: /);
  const exclude = read(dir, '.git', 'info', 'exclude');
  for (const entry of ['/CLAUDE.local.md', '/.claude/settings.local.json', '/.claude/skills/sdd', '/.claude/agents/implementer.md']) {
    assert.ok(exclude.includes(`\n${entry}\n`), entry);
  }
  assert.equal(fs.existsSync(path.join(dir, '.gitignore')), false);

  const second = runInstaller(dir, '--apply');
  assert.equal(second.code, 0);
  const results = second.out.split('\n').filter((line) => line.includes('  · ')).map((line) => line.split('  · ').pop());
  assert.ok(results.length > 0);
  assert.ok(results.every((r) => r === 'sin cambios'), second.out);
});

test('--project omite destinos ajenos, no los excluye y los lista al final', (t) => {
  const dir = makeProject();
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.mkdirSync(path.join(dir, '.claude', 'skills', 'sdd'), { recursive: true });
  fs.writeFileSync(path.join(dir, '.claude', 'skills', 'sdd', 'SKILL.md'), 'mía');
  fs.mkdirSync(path.join(dir, '.claude', 'agents'));
  fs.writeFileSync(path.join(dir, '.claude', 'agents', 'planner.md'), 'mío');

  const { code, out } = runInstaller(dir, '--apply');

  assert.equal(code, 0);
  assert.equal(read(dir, '.claude', 'skills', 'sdd', 'SKILL.md'), 'mía');
  assert.equal(read(dir, '.claude', 'agents', 'planner.md'), 'mío');
  const exclude = read(dir, '.git', 'info', 'exclude');
  assert.ok(!exclude.includes('/.claude/skills/sdd\n'));
  assert.ok(!exclude.includes('/.claude/agents/planner.md'));
  assert.ok(exclude.includes('/.claude/agents/implementer.md'));
  const summary = out.slice(out.lastIndexOf('Omitidos'));
  assert.ok(summary.includes(path.join(dir, '.claude', 'skills', 'sdd')));
  assert.ok(summary.includes(path.join(dir, '.claude', 'agents', 'planner.md')));
});

test('--project --uninstall --apply revierte solo lo propio y borra archivos vacíos', (t) => {
  const dir = makeProject();
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.writeFileSync(path.join(dir, 'CLAUDE.local.md'), 'nota propia\n');
  fs.mkdirSync(path.join(dir, '.claude', 'agents'), { recursive: true });
  fs.writeFileSync(path.join(dir, '.claude', 'agents', 'planner.md'), 'mío');
  const originalExclude = read(dir, '.git', 'info', 'exclude');

  runInstaller(dir, '--apply');
  const { code } = runInstaller(dir, '--uninstall', '--apply');

  assert.equal(code, 0);
  assert.equal(read(dir, 'CLAUDE.local.md'), 'nota propia\n');
  assert.equal(read(dir, '.claude', 'agents', 'planner.md'), 'mío');
  assert.equal(fs.existsSync(path.join(dir, '.claude', 'settings.local.json')), false);
  assert.equal(fs.existsSync(path.join(dir, '.claude', 'skills', 'sdd')), false);
  assert.equal(fs.existsSync(path.join(dir, '.claude', 'agents', 'implementer.md')), false);
  assert.equal(read(dir, '.git', 'info', 'exclude'), originalExclude);
  assert.equal(fs.existsSync(path.join(dir, '.claude', 'skills')), false);
});

test('--project --uninstall --apply quita las carpetas .claude que quedaron vacías', (t) => {
  const dir = makeProject();
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));

  runInstaller(dir, '--apply');
  assert.equal(runInstaller(dir, '--uninstall', '--apply').code, 0);

  assert.equal(fs.existsSync(path.join(dir, '.claude')), false);
  assert.equal(fs.existsSync(path.join(dir, 'CLAUDE.local.md')), false);
});

test('--project omite destinos cuya carpeta padre es un enlace hacia fuera del proyecto', (t) => {
  const dir = makeProject();
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'aw-outside-'));
  t.after(() => {
    fs.rmSync(dir, { recursive: true, force: true });
    fs.rmSync(outside, { recursive: true, force: true });
  });
  fs.symlinkSync(outside, path.join(dir, '.claude'), 'junction');

  const { code, out } = runInstaller(dir, '--apply');

  assert.equal(code, 0);
  assert.deepEqual(fs.readdirSync(outside), []);
  const summary = out.slice(out.lastIndexOf('Omitidos'));
  assert.ok(summary.includes(path.join(dir, '.claude', 'settings.local.json')));
  assert.ok(summary.includes(path.join(dir, '.claude', 'agents', 'implementer.md')));
  assert.ok(!read(dir, '.git', 'info', 'exclude').includes('/.claude/'));
});

test('findForeignReason marca como ajeno un destino cuya carpeta padre sale del proyecto', () => {
  const block = { type: 'block', path: '/p/.claude/x.md', content: 'x' };
  assert.ok(findForeignReason(block, { kind: 'missing', tracked: false, escapingParent: '/p/.claude' }));
});

test('revertir json-ensure conserva el archivo vacío salvo que la acción pida borrarlo', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aw-json-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const ensure = { 'permissions.ask': ['Bash(git commit:*)'] };
  const global = { type: 'json-ensure', path: path.join(dir, 'settings.json'), ensure, summary: 's' };
  const local = { ...global, path: path.join(dir, 'settings.local.json'), removeIfEmpty: true };

  for (const action of [global, local]) { apply(action); revert(action); }

  assert.equal(read(dir, 'settings.json'), '{}\n');
  assert.equal(fs.existsSync(local.path), false);
});

function makeCommunity(layout) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aw-community-'));
  for (const [sub, names] of Object.entries(layout)) {
    for (const name of names) {
      fs.mkdirSync(path.join(dir, sub, name), { recursive: true });
      fs.writeFileSync(path.join(dir, sub, name, 'SKILL.md'), `# ${name}\n`);
    }
  }
  return dir;
}

test('planCommunitySkills enlaza claude y shared, cede ante conflictos y no instala codex por defecto', (t) => {
  const communityDir = makeCommunity({ claude: ['a', 'sdd', 'dup'], shared: ['b', 'dup'], codex: ['c'] });
  t.after(() => fs.rmSync(communityDir, { recursive: true, force: true }));
  const skillsRoot = path.resolve('/p/.claude/skills');

  const actions = planCommunitySkills({ communityDir, workflowSkills: ['sdd'], skillsRoot });

  const summary = actions.map((a) => `${a.type}:${path.basename(a.path)}`).sort();
  assert.deepEqual(summary, ['link:a', 'link:b', 'link:dup', 'skip:dup', 'skip:sdd']);
  assert.equal(actions.find((a) => a.path.endsWith('dup') && a.type === 'link').target, path.join(communityDir, 'claude', 'dup'));
});

test('planCommunitySkills instala codex solo si se pide entre los orígenes', (t) => {
  const communityDir = makeCommunity({ claude: ['a'], codex: ['c', 'a'] });
  t.after(() => fs.rmSync(communityDir, { recursive: true, force: true }));
  const skillsRoot = path.resolve('/p/.agents/skills');

  const actions = planCommunitySkills({ communityDir, workflowSkills: [], skillsRoot, sources: ['claude', 'shared', 'codex'] });

  const summary = actions.map((a) => `${a.type}:${path.basename(a.path)}`).sort();
  assert.deepEqual(summary, ['link:a', 'link:c', 'skip:a']);
});

test('planCommunitySkills no falla si community-skills no existe', () => {
  const result = planCommunitySkills({ communityDir: path.join(os.tmpdir(), 'aw-no-existe'), workflowSkills: [], skillsRoot: '/p' });
  assert.deepEqual(result, []);
});

test('las skills de la comunidad se enlazan, se excluyen y se quitan al desinstalar', (t) => {
  const communityDir = makeCommunity({ claude: ['a'], shared: ['b'] });
  const root = makeProject();
  t.after(() => {
    fs.rmSync(communityDir, { recursive: true, force: true });
    fs.rmSync(root, { recursive: true, force: true });
  });
  const actions = planCommunitySkills({ communityDir, workflowSkills: [], skillsRoot: path.join(root, '.claude', 'skills') });
  const excludePath = path.join(root, '.git', 'info', 'exclude');
  const planned = planProjectGroups([{ label: 'g', actions }], { root, excludePath, probe: createDiskProbe(root) }).flatMap((g) => g.actions);

  planned.forEach(apply);

  for (const name of ['a', 'b']) assert.ok(fs.lstatSync(path.join(root, '.claude', 'skills', name)).isSymbolicLink());
  assert.ok(read(excludePath).includes('\n/.claude/skills/a\n'));

  [...planned].reverse().forEach(revert);

  assert.equal(fs.existsSync(path.join(root, '.claude')), false);
  assert.equal(fs.existsSync(path.join(root, '.claude', 'skills', 'a')), false);
});

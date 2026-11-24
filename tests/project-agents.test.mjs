import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GENERATED_NOTE } from '../scripts/lib.mjs';
import qwen from '../adapters/qwen.mjs';

const repoDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const installer = path.join(repoDir, 'scripts', 'install.mjs');
const rolesRef = `${path.join(repoDir, 'roles').replaceAll('\\', '/')}/coordinator.md`;
const COPILOT_FILE_NAME = /^[a-z0-9\-_.]+$/;

function makeProject(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aw-agents-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  execFileSync('git', ['init', '-q', dir]);
  return dir;
}

function runInstaller(dir, ...flags) {
  const result = spawnSync(process.execPath, [installer, '--project', '--dir', dir, ...flags], { encoding: 'utf8' });
  return { code: result.status, out: result.stdout + result.stderr };
}

const read = (...parts) => fs.readFileSync(path.join(...parts), 'utf8');
const exists = (...parts) => fs.existsSync(path.join(...parts));
const isLink = (...parts) => fs.lstatSync(path.join(...parts)).isSymbolicLink();
const write = (dir, relative, content) => {
  fs.mkdirSync(path.dirname(path.join(dir, relative)), { recursive: true });
  fs.writeFileSync(path.join(dir, relative), content);
};
const gitStatus = (dir) => execFileSync('git', ['-C', dir, 'status', '--porcelain'], { encoding: 'utf8' });

/** Todo lo que hay en el proyecto (salvo .git) con su contenido, más el exclude de git. */
function snapshot(root) {
  const entries = {};
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      const relative = path.relative(root, full).split(path.sep).join('/');
      if (relative === '.git') continue;
      if (entry.isSymbolicLink()) entries[relative] = 'enlace';
      else if (entry.isDirectory()) { entries[relative] = 'carpeta'; walk(full); } else entries[relative] = fs.readFileSync(full, 'utf8');
    }
  };
  walk(root);
  const excludePath = path.join(root, '.git', 'info', 'exclude');
  return { entries, exclude: fs.existsSync(excludePath) ? fs.readFileSync(excludePath, 'utf8') : null };
}

test('--project --apply instala cada agente en su ruta, todo excluido y git status limpio', (t) => {
  const dir = makeProject(t);

  const { code, out } = runInstaller(dir, '--apply');

  assert.equal(code, 0, out);
  assert.ok(isLink(dir, '.claude', 'skills', 'sdd'));
  for (const skillsDir of ['.agents', '.bob', '.qwen']) {
    assert.ok(isLink(dir, skillsDir, 'skills', 'sdd'), skillsDir);
    assert.equal(exists(dir, skillsDir, 'skills', 'init-workflow'), false, skillsDir);
  }
  for (const rules of [['.opencode', 'agent-workflow.md'], ['.agents', 'rules', 'agent-workflow.md'],
    ['.bob', 'rules', 'agent-workflow.md'], ['.github', 'copilot-instructions.md'], ['.kimi-code', 'AGENTS.md']]) {
    const content = read(dir, ...rules);
    assert.ok(content.includes(GENERATED_NOTE), rules.join('/'));
    assert.ok(content.includes(rolesRef), rules.join('/'));
  }
  assert.match(read(dir, '.qwen', 'QWEN.local.md'), /agent-workflow:start/);
  assert.ok(read(dir, '.qwen', 'QWEN.local.md').includes(rolesRef));
  assert.deepEqual(JSON.parse(read(dir, '.opencode', 'opencode.json')), { instructions: ['.opencode/agent-workflow.md'] });
  assert.match(read(dir, '.opencode', 'agents', 'implementer.md'), /permission:\n {2}edit:/);
  assert.match(read(dir, '.github', 'agents', 'implementer.agent.md'), /tools: \['read'/);
  for (const file of fs.readdirSync(path.join(dir, '.github', 'agents'))) assert.match(file, COPILOT_FILE_NAME);
  assert.match(out, /Codex: solo skills: sus reglas solo se leen de AGENTS\.md versionado/);
  assert.match(out, /MiniMax: solo skills: sus reglas solo se leen de AGENTS\.md versionado/);
  assert.ok(!/no instalada/.test(out));

  const exclude = read(dir, '.git', 'info', 'exclude');
  for (const entry of ['/.agents/skills/sdd', '/.opencode/opencode.json', '/.github/agents/planner.agent.md', '/.kimi-code/AGENTS.md', '/.qwen/QWEN.local.md']) {
    assert.ok(exclude.includes(`\n${entry}\n`), entry);
  }
  assert.equal(gitStatus(dir), '');

  const second = runInstaller(dir, '--apply');
  assert.equal(second.code, 0);
  const results = second.out.split('\n').filter((line) => line.includes('  · ')).map((line) => line.split('  · ').pop());
  assert.ok(results.every((r) => r === 'sin cambios'), second.out);
});

test('--project omite opencode.json versionado y copilot-instructions.md o .kimi-code/AGENTS.md existentes', (t) => {
  const dir = makeProject(t);
  write(dir, '.opencode/opencode.json', '{"theme":"x"}\n');
  execFileSync('git', ['-C', dir, 'add', '.opencode/opencode.json']);
  write(dir, '.github/copilot-instructions.md', 'mías\n');
  write(dir, '.kimi-code/AGENTS.md', 'mías\n');

  const { code, out } = runInstaller(dir, '--apply');

  assert.equal(code, 0, out);
  assert.equal(read(dir, '.opencode', 'opencode.json'), '{"theme":"x"}\n');
  assert.equal(exists(dir, '.opencode', 'agent-workflow.md'), false);
  assert.ok(exists(dir, '.opencode', 'agents', 'planner.md'));
  assert.match(out, /agent-workflow\.md \(OpenCode no lo cargaría sin opencode\.json\)/);
  assert.equal(read(dir, '.github', 'copilot-instructions.md'), 'mías\n');
  assert.equal(read(dir, '.kimi-code', 'AGENTS.md'), 'mías\n');
  assert.ok(exists(dir, '.github', 'agents', 'planner.agent.md'));
  const exclude = read(dir, '.git', 'info', 'exclude');
  for (const entry of ['/.opencode/opencode.json', '/.github/copilot-instructions.md', '/.kimi-code/AGENTS.md']) {
    assert.ok(!exclude.includes(entry), entry);
  }
  const summary = out.slice(out.lastIndexOf('Omitidos'));
  for (const skipped of [['.opencode', 'opencode.json'], ['.github', 'copilot-instructions.md'], ['.kimi-code', 'AGENTS.md']]) {
    assert.ok(summary.includes(path.join(dir, ...skipped)), skipped.join('/'));
  }
});

test('--project no modifica ni oculta un opencode.json preexistente sin versionar', (t) => {
  const dir = makeProject(t);
  write(dir, '.opencode/opencode.json', '{"theme":"x"}\n');

  const { code, out } = runInstaller(dir, '--apply');

  assert.equal(code, 0, out);
  assert.equal(read(dir, '.opencode', 'opencode.json'), '{"theme":"x"}\n');
  assert.equal(exists(dir, '.opencode', 'agent-workflow.md'), false);
  assert.ok(!read(dir, '.git', 'info', 'exclude').includes('/.opencode/opencode.json'));
  assert.match(gitStatus(dir), /\.opencode\/(opencode\.json)?\n/);
  assert.match(out, /opencode\.json \(ya existe: no se modifica ni se oculta\)/);
});

test('--project --only limita los agentes instalados', (t) => {
  const dir = makeProject(t);

  assert.equal(runInstaller(dir, '--apply', '--only', 'opencode,codex').code, 0);

  assert.ok(exists(dir, '.opencode', 'agent-workflow.md'));
  assert.ok(isLink(dir, '.agents', 'skills', 'sdd'));
  for (const other of ['CLAUDE.local.md', '.claude', '.github', '.qwen', '.bob', '.kimi-code', path.join('.agents', 'rules')]) {
    assert.equal(exists(dir, other), false, other);
  }
});

test('--project --only sin agentes de .agents/skills no la crea', (t) => {
  const dir = makeProject(t);

  assert.equal(runInstaller(dir, '--apply', '--only', 'qwen,bob').code, 0);

  assert.ok(isLink(dir, '.qwen', 'skills', 'sdd'));
  assert.ok(isLink(dir, '.bob', 'skills', 'sdd'));
  assert.equal(exists(dir, '.agents'), false);
});

test('--project --only rechaza agentes desconocidos sin tocar nada', (t) => {
  const dir = makeProject(t);

  const { code, out } = runInstaller(dir, '--apply', '--only', 'claude,gemini');

  assert.equal(code, 1);
  assert.match(out, /gemini/);
  assert.equal(exists(dir, 'CLAUDE.local.md'), false);
});

test('--project --uninstall --apply deja el proyecto exactamente como estaba', (t) => {
  const dir = makeProject(t);
  write(dir, '.github/workflows/ci.yml', 'on: push\n');
  write(dir, '.opencode/opencode.json', '{\n  "theme": "x"\n}\n');
  write(dir, '.agents/skills/mia/SKILL.md', 'mía\n');
  write(dir, '.qwen/QWEN.local.md', 'nota\n');
  write(dir, '.git/info/exclude', '*.tmp\n');
  const before = snapshot(dir);

  assert.equal(runInstaller(dir, '--apply').code, 0);
  assert.equal(read(dir, '.opencode', 'opencode.json'), before.entries['.opencode/opencode.json']);
  const { code, out } = runInstaller(dir, '--uninstall', '--apply');

  assert.equal(code, 0, out);
  assert.deepEqual(snapshot(dir), before);
});

const excludeBlock = (dir) => {
  const current = read(dir, '.git', 'info', 'exclude');
  return current.slice(current.indexOf('# agent-workflow:start'));
};

test('--only conserva lo instalado de los demás agentes y --uninstall --only quita solo lo suyo', (t) => {
  const dir = makeProject(t);
  write(dir, '.git/info/exclude', '*.tmp\n');
  const before = snapshot(dir);
  assert.equal(runInstaller(dir, '--apply').code, 0);
  const fullBlock = excludeBlock(dir);

  assert.equal(runInstaller(dir, '--apply', '--only', 'claude').code, 0);
  assert.equal(gitStatus(dir), '');
  assert.equal(excludeBlock(dir), fullBlock);

  const opencode = runInstaller(dir, '--apply', '--only', 'opencode');
  assert.ok(!/omitido .*opencode\.json/.test(opencode.out), opencode.out);

  assert.equal(runInstaller(dir, '--uninstall', '--apply', '--only', 'claude').code, 0);
  assert.equal(exists(dir, 'CLAUDE.local.md'), false);
  assert.equal(exists(dir, '.claude'), false);
  assert.ok(isLink(dir, '.agents', 'skills', 'sdd'));
  assert.ok(exists(dir, '.opencode', 'agent-workflow.md'));
  assert.equal(gitStatus(dir), '');
  assert.ok(!excludeBlock(dir).includes('/CLAUDE.local.md'));

  assert.equal(runInstaller(dir, '--uninstall', '--apply', '--only', 'opencode,antigravity,copilot,kimi').code, 0);
  assert.ok(isLink(dir, '.agents', 'skills', 'sdd'), 'Codex y MiniMax siguen usando .agents/skills');
  assert.equal(exists(dir, '.opencode'), false);
  assert.equal(gitStatus(dir), '');

  assert.equal(runInstaller(dir, '--uninstall', '--apply').code, 0);
  assert.deepEqual(snapshot(dir), before);
});

test('al desinstalar, opencode.json se revierte antes de quitar la exclusión', (t) => {
  const dir = makeProject(t);
  runInstaller(dir, '--apply', '--only', 'opencode');

  const { out } = runInstaller(dir, '--uninstall', '--only', 'opencode');

  assert.ok(out.indexOf('opencode.json') < out.indexOf('exclusión'), out);
});

test('los adaptadores solo de proyecto rechazan el modo global', () => {
  assert.throws(() => qwen.plan({ scope: 'global', warnings: [] }), /--project/);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { omitForeign } from '../scripts/project.mjs';

const repoDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const installer = path.join(repoDir, 'scripts', 'install.mjs');
const initSkill = path.join(repoDir, 'skills', 'init-workflow');

function makeHome(t) {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'aw-home-'));
  t.after(() => fs.rmSync(home, { recursive: true, force: true }));
  return home;
}

function runInstaller(home, ...flags) {
  const result = spawnSync(process.execPath, [installer, '--home', home, ...flags], { encoding: 'utf8' });
  return { code: result.status, out: result.stdout + result.stderr };
}

/** Archivos y enlaces bajo `root` (rutas relativas con '/'); las carpetas vacías no cuentan. */
function listEntries(root) {
  const entries = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory() && !entry.isSymbolicLink()) walk(full);
      else entries.push(path.relative(root, full).split(path.sep).join('/'));
    }
  };
  walk(root);
  return entries.sort();
}

const isLinkTo = (linkPath, target) => fs.lstatSync(linkPath).isSymbolicLink()
  && path.resolve(fs.readlinkSync(linkPath)) === path.resolve(target);

test('omitForeign reemplaza solo los destinos ajenos por acciones skip', () => {
  const own = { type: 'link', path: '/h/.claude/skills/a', target: '/repo/skills/a' };
  const foreign = { type: 'link', path: '/h/.claude/skills/b', target: '/repo/skills/b' };
  const probe = (p) => (p === foreign.path ? { kind: 'dir', tracked: false } : { kind: 'missing', tracked: false });

  const planned = omitForeign([own, foreign], probe);

  assert.equal(planned[0], own);
  assert.equal(planned[1].type, 'skip');
  assert.equal(planned[1].path, foreign.path);
});

test('--init-only simula por defecto sin tocar el home', (t) => {
  const home = makeHome(t);

  const { code, out } = runInstaller(home, '--init-only');

  assert.equal(code, 0);
  assert.match(out, /init-workflow/);
  assert.deepEqual(fs.readdirSync(home), []);
});

test('--init-only --apply instala solo el enlace a init-workflow y es idempotente', (t) => {
  const home = makeHome(t);

  assert.equal(runInstaller(home, '--init-only', '--apply').code, 0);

  assert.deepEqual(listEntries(home), ['.claude/skills/init-workflow']);
  assert.ok(isLinkTo(path.join(home, '.claude', 'skills', 'init-workflow'), initSkill));
  const second = runInstaller(home, '--init-only', '--apply');
  const results = second.out.split('\n').filter((line) => line.includes('  · ')).map((line) => line.split('  · ').pop());
  assert.deepEqual(results, ['sin cambios']);
});

test('--init-only omite un destino ajeno y --uninstall lo conserva', (t) => {
  const home = makeHome(t);
  const foreign = path.join(home, '.claude', 'skills', 'init-workflow');
  fs.mkdirSync(foreign, { recursive: true });
  fs.writeFileSync(path.join(foreign, 'SKILL.md'), 'mía');

  const install = runInstaller(home, '--init-only', '--apply');
  const uninstall = runInstaller(home, '--init-only', '--uninstall', '--apply');

  assert.equal(install.code, 0);
  assert.ok(install.out.slice(install.out.lastIndexOf('Omitidos')).includes(foreign));
  assert.equal(uninstall.code, 0);
  assert.deepEqual(listEntries(home), ['.claude/skills/init-workflow/SKILL.md']);
  assert.equal(fs.readFileSync(path.join(foreign, 'SKILL.md'), 'utf8'), 'mía');
});

test('--init-only --uninstall --apply conserva un enlace ajeno en el destino', (t) => {
  const home = makeHome(t);
  const elsewhere = path.join(home, 'otra-skill');
  fs.mkdirSync(elsewhere);
  const destination = path.join(home, '.claude', 'skills', 'init-workflow');
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.symlinkSync(elsewhere, destination, 'junction');

  const install = runInstaller(home, '--init-only', '--apply');
  const uninstall = runInstaller(home, '--init-only', '--uninstall', '--apply');

  assert.equal(install.code, 0);
  assert.ok(install.out.slice(install.out.lastIndexOf('Omitidos')).includes(destination));
  assert.equal(uninstall.code, 0);
  assert.ok(isLinkTo(destination, elsewhere));
});

test('--init-only simula sin fallar con un home que todavía no existe', (t) => {
  const home = path.join(makeHome(t), 'no-existe');

  const { code, out } = runInstaller(home, '--init-only');

  assert.equal(code, 0, out);
  assert.match(out, /init-workflow/);
  assert.equal(fs.existsSync(home), false);
});

test('--init-only --uninstall --apply quita el enlace propio', (t) => {
  const home = makeHome(t);

  runInstaller(home, '--init-only', '--apply');
  assert.equal(runInstaller(home, '--init-only', '--uninstall', '--apply').code, 0);

  assert.deepEqual(listEntries(home), []);
});

test('global completo → desinstalar deja solo lo ajeno → --init-only deja solo su enlace', (t) => {
  const home = makeHome(t);
  fs.mkdirSync(path.join(home, '.claude'));
  fs.writeFileSync(path.join(home, '.claude', 'CLAUDE.md'), 'nota propia\n');
  fs.writeFileSync(path.join(home, '.claude', 'settings.json'), JSON.stringify({ model: 'x' }));
  const foreignEntries = listEntries(home);

  assert.equal(runInstaller(home, '--apply').code, 0);
  assert.ok(listEntries(home).length > foreignEntries.length);
  assert.ok(isLinkTo(path.join(home, '.claude', 'skills', 'init-workflow'), initSkill));
  assert.equal(runInstaller(home, '--uninstall', '--apply').code, 0);

  assert.deepEqual(listEntries(home), foreignEntries);
  assert.equal(fs.readFileSync(path.join(home, '.claude', 'CLAUDE.md'), 'utf8'), 'nota propia\n');
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(home, '.claude', 'settings.json'), 'utf8')), { model: 'x' });

  assert.equal(runInstaller(home, '--init-only', '--apply').code, 0);
  assert.deepEqual(listEntries(home), [...foreignEntries, '.claude/skills/init-workflow'].sort());
});

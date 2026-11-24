// Modo por proyecto: decide qué destinos son propios, omite los ajenos y arma la exclusión
// en .git/info/exclude. La lógica de decisión es pura; el acceso a disco está en createDiskProbe.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { GENERATED_NOTE } from './lib.mjs';

const NOT_REGULAR_FILE = 'ya existe y no es un archivo común';

/** Devuelve por qué el destino es ajeno, o null si es nuestro o está libre. */
export function findForeignReason(action, probe) {
  if (probe.escapingParent) return `${probe.escapingParent} es un enlace hacia fuera del proyecto`;
  if (probe.tracked) return 'está versionado en git';
  if (probe.kind === 'missing') return null;
  switch (action.type) {
    case 'link':
      return probe.kind === 'link' && path.resolve(probe.linkTarget) === path.resolve(action.target)
        ? null : 'ya existe y no es un enlace de agent-workflow';
    case 'file':
      return probe.kind === 'file' && probe.content.includes(GENERATED_NOTE)
        ? null : 'ya existe y no fue generado por agent-workflow';
    case 'block':
    case 'exclude':
      return probe.kind === 'file' ? null : NOT_REGULAR_FILE;
    case 'json-ensure':
      if (probe.kind !== 'file') return NOT_REGULAR_FILE;
      return isJson(probe.content) ? null : 'no es un JSON válido';
    default:
      return null;
  }
}

function isJson(text) {
  try { JSON.parse(text); return true; } catch { return false; }
}

const COMMUNITY_INSTALLED_DIRS = ['claude', 'shared'];
const CODEX_NOTICE = 'no instalada: Codex sin modo por proyecto';

function listSkillDirs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((name) => fs.existsSync(path.join(dir, name, 'SKILL.md')))
    .map((name) => ({ name, dir: path.join(dir, name) }));
}

/**
 * Skills de la comunidad para Claude Code (claude/ y luego shared/). Ante un nombre repetido gana
 * la del workflow, o la primera encontrada; la otra pasa a `skip`. Las de codex/ solo se informan.
 */
export function planCommunitySkills({ communityDir, workflowSkills, skillsRoot }) {
  const taken = new Set(workflowSkills);
  const actions = [];
  for (const sub of COMMUNITY_INSTALLED_DIRS) {
    for (const { name, dir } of listSkillDirs(path.join(communityDir, sub))) {
      const skillPath = path.join(skillsRoot, name);
      if (taken.has(name)) {
        actions.push({ type: 'skip', path: skillPath, reason: `nombre repetido: community-skills/${sub}/${name} cede ante otra skill` });
        continue;
      }
      taken.add(name);
      actions.push({ type: 'link', path: skillPath, target: dir });
    }
  }
  const notInstalled = listSkillDirs(path.join(communityDir, 'codex')).map(({ name }) => `${name} (${CODEX_NOTICE})`);
  return { actions, notInstalled };
}

/**
 * Reemplaza los destinos ajenos por acciones `skip`, agrega la exclusión de los propios y,
 * al principio (se revierte al final), las carpetas creadas a limpiar si quedan vacías.
 */
export function planProjectActions(actions, { root, excludePath, probe }) {
  const planned = omitForeign(actions, probe);
  const own = planned.filter((action) => action.type !== 'skip');
  const exclude = { type: 'exclude', path: excludePath, entries: own.map((action) => toExcludeEntry(root, action.path)) };
  const parents = new Set(own.flatMap((action) => parentsBetween(root, action.path)));
  const deepestFirst = [...parents].sort((a, b) => b.length - a.length);
  return [{ type: 'empty-dirs', paths: deepestFirst }, ...planned, ...omitForeign([exclude], probe)];
}

/** Reemplaza por acciones `skip` los destinos que ya existen y no son nuestros. */
export function omitForeign(actions, probe) {
  return actions.map((action) => {
    const reason = findForeignReason(action, probe(action.path));
    return reason ? { type: 'skip', path: action.path, reason } : action;
  });
}

/** Carpetas entre la raíz (excluida) y el destino (excluido), de la más externa a la más interna. */
function parentsBetween(root, target) {
  const dirs = [];
  for (let dir = path.dirname(target); dir !== root && dir.startsWith(root + path.sep); dir = path.dirname(dir)) {
    dirs.unshift(dir);
  }
  return dirs;
}

const toRelative = (root, target) => path.relative(root, target).split(path.sep).join('/');
const toExcludeEntry = (root, target) => `/${toRelative(root, target)}`;

/** `tracked`: rutas versionadas en git, relativas a `root` (ver listTrackedPaths). */
export function createDiskProbe(root, tracked = []) {
  // Una raíz que aún no existe no tiene carpetas padre que puedan ser enlaces.
  const realRoot = fs.existsSync(root) ? fs.realpathSync(root) : path.resolve(root);
  return (target) => {
    const relative = toRelative(root, target);
    const isTracked = tracked.some((file) => file === relative || file.startsWith(`${relative}/`));
    const escapingParent = findEscapingParent(root, realRoot, target);
    return { ...inspectPath(target), tracked: isTracked, ...(escapingParent && { escapingParent }) };
  };
}

/** Primera carpeta padre que es un enlace cuyo destino real queda fuera del proyecto. */
function findEscapingParent(root, realRoot, target) {
  for (const dir of parentsBetween(root, target)) {
    let stat;
    try { stat = fs.lstatSync(dir); } catch { return null; }
    if (!stat.isSymbolicLink()) continue;
    let real;
    try { real = fs.realpathSync(dir); } catch { return dir; }
    if (!real.toLowerCase().startsWith(realRoot.toLowerCase() + path.sep)) return dir;
  }
  return null;
}

export function listTrackedPaths(root, paths) {
  if (!paths.length) return [];
  const relativePaths = paths.map((p) => toRelative(root, p));
  const output = execFileSync('git', ['-C', root, 'ls-files', '-z', '--', ...relativePaths], { encoding: 'utf8' });
  return output.split('\0').filter(Boolean);
}

function inspectPath(target) {
  let stat;
  try { stat = fs.lstatSync(target); } catch { return { kind: 'missing' }; }
  if (stat.isSymbolicLink()) return { kind: 'link', linkTarget: path.resolve(path.dirname(target), fs.readlinkSync(target)) };
  if (stat.isDirectory()) return { kind: 'dir' };
  return { kind: 'file', content: fs.readFileSync(target, 'utf8') };
}

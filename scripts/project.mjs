// Modo por proyecto: decide qué destinos son propios, omite los ajenos y arma la exclusión
// en .git/info/exclude. La lógica de decisión es pura; el acceso a disco está en createDiskProbe.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { GENERATED_NOTE, toAgentsLine } from './lib.mjs';

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
      if (action.createOnly && !probe.ownExcluded) return 'ya existe: no se modifica ni se oculta';
      return isJson(probe.content) ? null : 'no es un JSON válido';
    default:
      return null;
  }
}

function isJson(text) {
  try { JSON.parse(text); return true; } catch { return false; }
}

const COMMUNITY_SOURCES = ['claude', 'shared'];
/** .agents/skills la leen también Codex y los demás agentes del estándar abierto. */
export const SHARED_COMMUNITY_SOURCES = [...COMMUNITY_SOURCES, 'codex'];

function listSkillDirs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((name) => fs.existsSync(path.join(dir, name, 'SKILL.md')))
    .map((name) => ({ name, dir: path.join(dir, name) }));
}

/**
 * Skills de la comunidad, en el orden de `sources`. Ante un nombre repetido gana la del workflow,
 * o la primera encontrada; la otra pasa a `skip`.
 */
export function planCommunitySkills({ communityDir, workflowSkills, skillsRoot, sources = COMMUNITY_SOURCES }) {
  const taken = new Set(workflowSkills);
  const actions = [];
  for (const sub of sources) {
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
  return actions;
}

/**
 * En cada grupo reemplaza los destinos ajenos por acciones `skip` y agrega al principio (se revierte
 * al final) las carpetas a limpiar si quedan vacías. Suma un último grupo con una sola exclusión.
 * `kept`: grupos de agentes ya instalados que no se tocan; sus rutas siguen en el bloque.
 * La exclusión aplica `entries` (todo lo instalado, con la línea de `agents`) y al revertir
 * deja `remaining` (solo lo de `kept` y `keptAgents`); el bloque desaparece si queda vacío.
 */
export function planProjectGroups(groups, { root, excludePath, probe, kept = [], agents = [], keptAgents = [] }) {
  const planGroup = ({ label, actions }) => {
    const checked = omitOrphans(omitForeign(actions, probe));
    const parents = new Set(ownActions(checked).flatMap((action) => parentsBetween(root, action.path)));
    const deepestFirst = [...parents].sort((a, b) => b.length - a.length);
    return { label, actions: [{ type: 'empty-dirs', paths: deepestFirst }, ...checked] };
  };
  const planned = groups.map(planGroup);
  const keptPlanned = kept.map(planGroup);
  const entriesOf = (plannedGroups, agentIds) => [
    ...(agentIds.length ? [toAgentsLine(agentIds)] : []),
    ...ownActions(plannedGroups.flatMap((group) => group.actions)).map((action) => toExcludeEntry(root, action.path)),
  ];
  const exclude = {
    type: 'exclude',
    path: excludePath,
    entries: entriesOf([...planned, ...keptPlanned], agents),
    remaining: entriesOf(keptPlanned, keptAgents),
  };
  return [...planned, { label: 'Exclusión en git (.git/info/exclude)', actions: omitForeign([exclude], probe) }];
}

/** Omite las acciones cuyo `requires.path` quedó omitido: sin él no servirían. */
function omitOrphans(actions) {
  const skipped = new Set(actions.filter((action) => action.type === 'skip').map((action) => action.path));
  return actions.map((action) => (action.requires && skipped.has(action.requires.path)
    ? { type: 'skip', path: action.path, reason: action.requires.reason }
    : action));
}

const ownActions = (actions) => actions.filter((action) => action.type !== 'skip' && action.type !== 'empty-dirs');

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

/**
 * `tracked`: rutas versionadas en git, relativas a `root` (ver listTrackedPaths).
 * `ownExcluded`: entradas del bloque administrado de .git/info/exclude (ver readExcludeBlock).
 */
export function createDiskProbe(root, tracked = [], ownExcluded = []) {
  // Una raíz que aún no existe no tiene carpetas padre que puedan ser enlaces.
  const realRoot = fs.existsSync(root) ? fs.realpathSync(root) : path.resolve(root);
  return (target) => {
    const relative = toRelative(root, target);
    const isTracked = tracked.some((file) => file === relative || file.startsWith(`${relative}/`));
    const escapingParent = findEscapingParent(root, realRoot, target);
    return {
      ...inspectPath(target),
      tracked: isTracked,
      ownExcluded: ownExcluded.includes(toExcludeEntry(root, target)),
      ...(escapingParent && { escapingParent }),
    };
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

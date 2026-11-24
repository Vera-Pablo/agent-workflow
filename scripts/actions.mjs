// Ejecuta (o simula) las acciones que proponen los adaptadores.
// Tipos: link · file · block · json-ensure · exclude · skip. Nada se borra: lo existente se respalda.
import fs from 'node:fs';
import path from 'node:path';
import { BLOCK_START, BLOCK_END, GENERATED_NOTE, mergeExcludeBlock, removeExcludeBlock } from './lib.mjs';

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

export function describe(action) {
  switch (action.type) {
    case 'link': return `enlace   ${action.path} → ${action.target}`;
    case 'file': return `archivo  ${action.path}`;
    case 'block': return `bloque   ${action.path}`;
    case 'json-ensure': return `ajuste   ${action.path} (${action.summary})`;
    case 'prune': return `limpieza ${action.path} (enlaces a skills que ya no existen)`;
    case 'exclude': return `exclusión ${action.path} (${action.entries.length} rutas)`;
    case 'skip': return `omitido  ${action.path} (${action.reason})`;
    case 'empty-dirs': return `carpetas ${action.paths.length} creadas (se quitan al desinstalar si quedan vacías)`;
    default: throw new Error(`Acción desconocida: ${action.type}`);
  }
}

export function apply(action) {
  if (action.type === 'prune') return applyPrune(action);
  if (action.type === 'skip') return 'omitido';
  if (action.type === 'empty-dirs') return 'sin cambios';
  ensureParent(path.dirname(action.path));
  switch (action.type) {
    case 'link': return applyLink(action);
    case 'file': return applyFile(action);
    case 'block': return applyBlock(action);
    case 'json-ensure': return applyJsonEnsure(action);
    case 'exclude': return applyExclude(action);
    default: throw new Error(`Acción desconocida: ${action.type}`);
  }
}

export function revert(action) {
  switch (action.type) {
    case 'link': return isLinkTo(action.path, action.target) ? (removeLink(action.path), 'quitado') : 'sin cambios';
    case 'file': return isGenerated(action.path) ? (fs.rmSync(action.path), 'quitado') : 'sin cambios';
    case 'block': return removeBlock(action.path);
    case 'json-ensure': return revertJsonEnsure(action);
    case 'exclude': return revertExclude(action);
    case 'empty-dirs': return removeEmptyDirs(action);
    case 'prune':
    case 'skip': return 'sin cambios';
    default: throw new Error(`Acción desconocida: ${action.type}`);
  }
}

/** Quita enlaces que apuntan a skills del repo que ya no existen (renombradas o borradas). */
function applyPrune({ path: dir, ownedRoot }) {
  if (!fs.existsSync(dir)) return 'sin cambios';
  const removed = [];
  for (const entry of fs.readdirSync(dir)) {
    const linkPath = path.join(dir, entry);
    let target;
    try {
      if (!fs.lstatSync(linkPath).isSymbolicLink()) continue;
      target = path.resolve(dir, fs.readlinkSync(linkPath));
    } catch { continue; }
    const owned = target.toLowerCase().startsWith(path.resolve(ownedRoot).toLowerCase() + path.sep);
    if (owned && !fs.existsSync(target)) { removeLink(linkPath); removed.push(entry); }
  }
  return removed.length ? `quitados: ${removed.join(', ')}` : 'sin cambios';
}

/** Crea la carpeta destino; si hay un enlace roto en el camino, lo informa con claridad. */
function ensureParent(dir) {
  const broken = findDanglingAncestor(dir);
  if (broken) {
    throw new Error(`${broken} es un enlace roto (apunta a algo que ya no existe). `
      + `Quitalo con: cmd /c rmdir "${broken}" y volvé a correr el instalador.`);
  }
  fs.mkdirSync(dir, { recursive: true });
}

function findDanglingAncestor(dir) {
  let current = path.resolve(dir);
  while (current !== path.dirname(current)) {
    if (isDanglingLink(current) && !fs.existsSync(current)) return current;
    current = path.dirname(current);
  }
  return null;
}

function backup(target) {
  const destination = `${target}.respaldo-${stamp}`;
  fs.renameSync(target, destination);
  return destination;
}

function isLinkTo(linkPath, target) {
  try {
    if (!fs.lstatSync(linkPath).isSymbolicLink()) return false;
    return path.resolve(fs.readlinkSync(linkPath)) === path.resolve(target);
  } catch { return false; }
}

function removeLink(linkPath) {
  try { fs.unlinkSync(linkPath); } catch { fs.rmdirSync(linkPath); }
}

function applyLink({ path: linkPath, target }) {
  if (isLinkTo(linkPath, target)) return 'sin cambios';
  let note = 'creado';
  if (fs.existsSync(linkPath) || isDanglingLink(linkPath)) note = `respaldado en ${backup(linkPath)}`;
  // 'junction' no requiere permisos de administrador en Windows; en otros sistemas se ignora.
  fs.symlinkSync(target, linkPath, 'junction');
  return note;
}

function isDanglingLink(linkPath) {
  try { return fs.lstatSync(linkPath).isSymbolicLink(); } catch { return false; }
}

function isGenerated(filePath) {
  return fs.existsSync(filePath) && fs.readFileSync(filePath, 'utf8').includes(GENERATED_NOTE);
}

function applyFile({ path: filePath, content }) {
  if (fs.existsSync(filePath)) {
    const current = fs.readFileSync(filePath, 'utf8');
    if (current === content) return 'sin cambios';
    if (!current.includes(GENERATED_NOTE)) {
      const saved = backup(filePath);
      fs.writeFileSync(filePath, content);
      return `respaldado en ${saved}`;
    }
  }
  fs.writeFileSync(filePath, content);
  return 'escrito';
}

function applyBlock({ path: filePath, content }) {
  const block = `${BLOCK_START}\n${content.trim()}\n${BLOCK_END}\n`;
  const current = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
  const start = current.indexOf(BLOCK_START);
  const end = current.indexOf(BLOCK_END);
  let next;
  if (start !== -1 && end !== -1) {
    next = current.slice(0, start) + block + current.slice(end + BLOCK_END.length).replace(/^\r?\n/, '');
  } else {
    next = current.trim() ? `${block}\n${current}` : block;
  }
  if (next === current) return 'sin cambios';
  fs.writeFileSync(filePath, next);
  return start !== -1 ? 'actualizado' : 'agregado (tu contenido se conserva debajo)';
}

function removeBlock(filePath) {
  if (!fs.existsSync(filePath)) return 'sin cambios';
  const current = fs.readFileSync(filePath, 'utf8');
  const start = current.indexOf(BLOCK_START);
  const end = current.indexOf(BLOCK_END);
  if (start === -1 || end === -1) return 'sin cambios';
  const next = (current.slice(0, start) + current.slice(end + BLOCK_END.length)).trim();
  if (next) fs.writeFileSync(filePath, `${next}\n`); else fs.rmSync(filePath);
  return 'bloque quitado';
}

/** Agrega valores a arrays dentro de un JSON sin tocar el resto. { 'permissions.ask': [...] } */
function applyJsonEnsure({ path: filePath, ensure }) {
  const json = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : {};
  let changed = false;
  for (const [dotted, values] of Object.entries(ensure)) {
    const list = getArray(json, dotted);
    for (const value of values) if (!list.includes(value)) { list.push(value); changed = true; }
  }
  if (!changed) return 'sin cambios';
  fs.writeFileSync(filePath, `${JSON.stringify(json, null, 2)}\n`);
  return 'actualizado';
}

// Limitación conocida: si el usuario ya tenía alguno de estos valores, también se quita,
// porque el JSON no guarda cuáles agregamos nosotros.
function revertJsonEnsure({ path: filePath, ensure, removeIfEmpty }) {
  if (!fs.existsSync(filePath)) return 'sin cambios';
  const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  for (const [dotted, values] of Object.entries(ensure)) {
    const list = getArray(json, dotted);
    const kept = list.filter((value) => !values.includes(value));
    list.splice(0, list.length, ...kept);
    if (!list.length) removeKey(json, dotted);
  }
  if (removeIfEmpty && !Object.keys(json).length) fs.rmSync(filePath);
  else fs.writeFileSync(filePath, `${JSON.stringify(json, null, 2)}\n`);
  return 'valores quitados';
}

/** Quita, de la más interna a la más externa, las carpetas vacías; nunca enlaces ni carpetas con contenido. */
function removeEmptyDirs({ paths }) {
  const removed = [];
  for (const dir of paths) {
    let stat;
    try { stat = fs.lstatSync(dir); } catch { continue; }
    if (!stat.isDirectory() || fs.readdirSync(dir).length) continue;
    fs.rmdirSync(dir);
    removed.push(path.basename(dir));
  }
  return removed.length ? `quitadas: ${removed.join(', ')}` : 'sin cambios';
}

function applyExclude({ path: filePath, entries }) {
  const current = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
  const next = mergeExcludeBlock(current, entries);
  if (next === current) return 'sin cambios';
  fs.writeFileSync(filePath, next);
  return 'actualizado';
}

/** Deja en el bloque solo `remaining` (lo de los agentes que siguen instalados) o lo quita. */
function revertExclude({ path: filePath, remaining = [] }) {
  if (!fs.existsSync(filePath)) return 'sin cambios';
  const current = fs.readFileSync(filePath, 'utf8');
  const next = remaining.length ? mergeExcludeBlock(current, remaining) : removeExcludeBlock(current);
  if (next === current) return 'sin cambios';
  if (next.trim()) fs.writeFileSync(filePath, next); else fs.rmSync(filePath);
  return remaining.length ? 'actualizado' : 'bloque quitado';
}

function removeKey(json, dotted) {
  const keys = dotted.split('.');
  const last = keys.pop();
  const parent = keys.reduce((node, key) => node?.[key], json);
  if (parent) delete parent[last];
  if (keys.length && parent && !Object.keys(parent).length) removeKey(json, keys.join('.'));
}

function getArray(json, dotted) {
  const keys = dotted.split('.');
  const last = keys.pop();
  let node = json;
  for (const key of keys) node = node[key] ??= {};
  return (node[last] ??= []);
}

// Utilidades compartidas por el instalador y los adaptadores. Sin dependencias externas.
import fs from 'node:fs';
import path from 'node:path';

export const MARK = 'agent-workflow';
export const BLOCK_START = `<!-- ${MARK}:start · generado, no editar a mano -->`;
export const BLOCK_END = `<!-- ${MARK}:end -->`;
export const GENERATED_NOTE = `<!-- generado por ${MARK} · se regenera con scripts/install.mjs -->`;

/** Parser mínimo del frontmatter de los roles (solo el subconjunto de YAML que usamos). */
export function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: text };
  const data = {};
  let parentKey = null;
  for (const rawLine of match[1].split(/\r?\n/)) {
    const line = rawLine.replace(/\s+#.*$/, '');
    if (!line.trim()) continue;
    const nested = /^\s+/.test(line);
    const [, key, value] = line.trim().match(/^([\w-]+):\s*(.*)$/) ?? [];
    if (!key) continue;
    const parsed = parseValue(value);
    if (nested && parentKey) data[parentKey][key] = parsed;
    else if (value === '') { data[key] = {}; parentKey = key; }
    else { data[key] = parsed; parentKey = null; }
  }
  return { data, body: match[2].trimStart() };
}

function parseValue(value) {
  if (value.startsWith('[') && value.endsWith(']')) {
    return value.slice(1, -1).split(',').map((item) => unquote(item.trim())).filter(Boolean);
  }
  return unquote(value);
}

const unquote = (value) => value.replace(/^["']|["']$/g, '');

export function loadRoles(repoDir) {
  const rolesDir = path.join(repoDir, 'roles');
  return fs.readdirSync(rolesDir)
    .filter((file) => file.endsWith('.md') && file !== 'README.md')
    .map((file) => {
      const { data, body } = parseFrontmatter(fs.readFileSync(path.join(rolesDir, file), 'utf8'));
      return { ...data, body };
    });
}

export function loadSkillNames(repoDir) {
  const skillsDir = path.join(repoDir, 'skills');
  return fs.readdirSync(skillsDir)
    .filter((name) => fs.existsSync(path.join(skillsDir, name, 'SKILL.md')));
}

export function yamlString(value) {
  return JSON.stringify(String(value));
}

/** Instrucciones globales: bootstrap + constitución, con la ruta real de los roles. */
export function buildGlobalInstructions(ctx) {
  const bootstrap = fs.readFileSync(path.join(ctx.repoDir, 'core', 'bootstrap.md'), 'utf8')
    .replaceAll('{{ROLES}}', toDisplayPath(ctx.rolesDir));
  const constitution = fs.readFileSync(path.join(ctx.repoDir, 'core', 'constitution.md'), 'utf8');
  return `${bootstrap.trim()}\n\n---\n\n${constitution.trim()}\n`;
}

/** Archivo de reglas completo y propio (solo modo proyecto): se reconoce por la marca de generado. */
export function buildGeneratedRules(ctx) {
  return `${GENERATED_NOTE}\n\n${buildGlobalInstructions(ctx)}`;
}

export function skillLinks(ctx, skillsRoot) {
  return ctx.skills.map((skill) => ({ type: 'link', path: path.join(skillsRoot, skill), target: path.join(ctx.repoDir, 'skills', skill) }));
}

export const SKILLS_ONLY_NOTICE = 'solo skills: sus reglas solo se leen de AGENTS.md versionado';

export function requireProjectScope(ctx, label) {
  if (ctx.scope !== 'project') throw new Error(`${label} solo se instala por proyecto (--project).`);
}

export const toDisplayPath = (p) => p.replaceAll('\\', '/');

// .git/info/exclude usa sintaxis de .gitignore: el bloque se marca con comentarios '#'.
export const EXCLUDE_START = `# ${MARK}:start · generado, no editar a mano`;
export const EXCLUDE_END = `# ${MARK}:end`;

/** Reemplaza el bloque administrado por `entries`, salvo las que ya figuran fuera del bloque. */
export function mergeExcludeBlock(current, entries) {
  const outside = removeExcludeBlock(current);
  const present = new Set(outside.split(/\r?\n/).map((line) => line.trim()));
  const own = [...new Set(entries)].filter((entry) => !present.has(entry));
  if (!own.length) return outside;
  const block = `${[EXCLUDE_START, ...own, EXCLUDE_END].join('\n')}\n`;
  return outside.trim() ? `${outside.replace(/\s*$/, '\n')}${block}` : block;
}

// Línea de comentario dentro del bloque con los agentes instalados en el proyecto.
const AGENTS_PREFIX = '# agentes: ';
// Bloques anteriores sin esa línea: el modo proyecto solo instalaba Claude Code.
const LEGACY_AGENTS = ['claude'];

export const toAgentsLine = (agents) => `${AGENTS_PREFIX}${agents.join(',')}`;

/** Agentes instalados según el bloque administrado (ver readExcludeBlock). */
export function readInstalledAgents(blockLines) {
  if (!blockLines.length) return [];
  const line = blockLines.find((entry) => entry.startsWith(AGENTS_PREFIX));
  return line ? line.slice(AGENTS_PREFIX.length).split(',').filter(Boolean) : LEGACY_AGENTS;
}

/** Rutas del bloque administrado: lo que agent-workflow creó y excluyó en una instalación previa. */
export function readExcludeBlock(current) {
  const start = current.indexOf(EXCLUDE_START);
  const end = current.indexOf(EXCLUDE_END);
  if (start === -1 || end === -1) return [];
  return current.slice(start + EXCLUDE_START.length, end).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

export function removeExcludeBlock(current) {
  const start = current.indexOf(EXCLUDE_START);
  const end = current.indexOf(EXCLUDE_END);
  if (start === -1 || end === -1) return current;
  return current.slice(0, start) + current.slice(end + EXCLUDE_END.length).replace(/^\r?\n/, '');
}

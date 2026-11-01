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
    .replaceAll('{{ROLES}}', toDisplayPath(path.join(ctx.hubDir, 'roles')));
  const constitution = fs.readFileSync(path.join(ctx.repoDir, 'core', 'constitution.md'), 'utf8');
  return `${bootstrap.trim()}\n\n---\n\n${constitution.trim()}\n`;
}

export const toDisplayPath = (p) => p.replaceAll('\\', '/');

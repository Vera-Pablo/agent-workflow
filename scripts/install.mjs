#!/usr/bin/env node
// Instalador de agent-workflow.
//
//   node scripts/install.mjs                 → simula (muestra qué haría, no toca nada)
//   node scripts/install.mjs --apply         → instala
//   node scripts/install.mjs --uninstall     → simula la desinstalación (agregá --apply para hacerla)
//   node scripts/install.mjs --only claude,opencode
//   node scripts/install.mjs --project [--dir <ruta>] [--only claude,qwen] → dentro del proyecto
//   node scripts/install.mjs --init-only     → solo el enlace a la skill /init-workflow en ~/.claude
//
// Las skills y roles se enlazan (junctions) a este repo: después de un `git pull` ya están
// actualizados. Volvé a correr el instalador solo si cambiaron core/, roles/ o se agregó una skill.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadRoles, loadSkillNames, readExcludeBlock, readInstalledAgents, skillLinks } from './lib.mjs';
import { apply, describe, revert } from './actions.mjs';
import {
  SHARED_COMMUNITY_SOURCES, createDiskProbe, listTrackedPaths, omitForeign, planCommunitySkills, planProjectGroups,
} from './project.mjs';

const repoDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT_TARGETS = ['claude', 'opencode', 'copilot', 'antigravity', 'qwen', 'bob', 'kimi', 'codex', 'minimax'];
const INIT_SKILL = 'init-workflow';

function parseArgs(argv) {
  const args = { apply: false, uninstall: false, only: null, home: os.homedir(), project: false, dir: process.cwd() };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--apply') args.apply = true;
    else if (arg === '--uninstall') args.uninstall = true;
    else if (arg === '--only') args.only = argv[++i].split(',').map((s) => s.trim());
    else if (arg === '--home') args.home = path.resolve(argv[++i]);
    else if (arg === '--project') args.project = true;
    else if (arg === '--init-only') args.initOnly = true;
    else if (arg === '--dir') args.dir = path.resolve(argv[++i]);
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Argumento desconocido: ${arg}`);
  }
  return args;
}

function loadConfig() {
  const read = (file) => {
    const full = path.join(repoDir, file);
    return fs.existsSync(full) ? JSON.parse(fs.readFileSync(full, 'utf8')) : {};
  };
  const base = read('agent-workflow.config.json');
  const local = read('agent-workflow.local.json');
  return { ...base, ...local, models: { ...base.models, ...local.models } };
}

async function loadAdapters(targets) {
  const adapters = [];
  for (const id of targets) {
    const file = path.join(repoDir, 'adapters', `${id}.mjs`);
    if (!fs.existsSync(file)) throw new Error(`No existe el adaptador "${id}" (adapters/${id}.mjs).`);
    adapters.push((await import(new URL(`file://${file.replaceAll('\\', '/').replace(/^([A-Za-z]):/, '/$1:')}`))).default);
  }
  return adapters;
}

/** Acciones comunes: el repo y las skills quedan disponibles en ~/.agents (estándar abierto). */
function hubActions(ctx) {
  const ownedRoot = path.join(ctx.repoDir, 'skills');
  const prune = (dir) => ({ type: 'prune', path: dir, ownedRoot });
  const actions = [
    prune(path.join(ctx.home, '.agents', 'skills')),
    prune(path.join(ctx.home, '.claude', 'skills')),
    prune(path.join(ctx.home, '.gemini', 'config', 'skills')),
    { type: 'link', path: ctx.hubDir, target: ctx.repoDir },
  ];
  for (const skill of ctx.skills) {
    actions.push({ type: 'link', path: path.join(ctx.home, '.agents', 'skills', skill), target: path.join(ctx.repoDir, 'skills', skill) });
  }
  return actions;
}

function sharedContext(config) {
  return {
    repoDir,
    skills: loadSkillNames(repoDir),
    roles: loadRoles(repoDir),
    models: config.models ?? {},
    warnings: [],
  };
}

async function globalGroups(args, config) {
  const hubDir = path.join(args.home, '.agents', 'agent-workflow');
  const ctx = { ...sharedContext(config), home: args.home, root: args.home, scope: 'global', hubDir, rolesDir: path.join(hubDir, 'roles') };
  const groups = [{ label: 'Base común (~/.agents)', actions: hubActions(ctx) }];
  for (const adapter of await loadAdapters(args.only ?? config.targets)) groups.push({ label: adapter.label, actions: adapter.plan(ctx) });
  return { ctx, groups, displayRoot: { path: args.home, alias: '~' } };
}

/** Modo global mínimo: solo el enlace a la skill que prepara cada proyecto; lo ajeno se omite. */
function initOnlyGroups(args, config) {
  const ctx = { ...sharedContext(config), skills: [INIT_SKILL], roles: [] };
  const link = {
    type: 'link',
    path: path.join(args.home, '.claude', 'skills', INIT_SKILL),
    target: path.join(repoDir, 'skills', INIT_SKILL),
  };
  const groups = [{ label: `Claude Code (solo /${INIT_SKILL})`, actions: omitForeign([link], createDiskProbe(args.home)) }];
  return { ctx, groups, displayRoot: { path: args.home, alias: '~' } };
}

function selectGroups(args, config) {
  if (args.project) return projectGroups(args, config);
  if (args.initOnly) return initOnlyGroups(args, config);
  return globalGroups(args, config);
}

/**
 * Solo escribe dentro del proyecto; lo ajeno se omite y lo propio se excluye de git.
 * Sin init-workflow: el proyecto ya quedó activado.
 */
async function projectGroups(args, config) {
  const root = args.dir;
  const gitDir = path.join(root, '.git');
  if (!fs.existsSync(gitDir)) throw new Error(`${root} no es la raíz de un repositorio git (falta .git). No se modificó nada.`);
  if (!fs.statSync(gitDir).isDirectory()) throw new Error(`${gitDir} no es una carpeta (worktree o submódulo): no soportado. No se modificó nada.`);
  const targets = args.only ?? PROJECT_TARGETS;
  const unsupported = targets.filter((id) => !PROJECT_TARGETS.includes(id));
  if (unsupported.length) {
    throw new Error(`--project no admite: ${unsupported.join(', ')}. Opciones: ${PROJECT_TARGETS.join(', ')}. No se modificó nada.`);
  }
  const shared = sharedContext(config);
  const skills = shared.skills.filter((skill) => skill !== INIT_SKILL);
  const ctx = { ...shared, skills, root, scope: 'project', rolesDir: path.join(repoDir, 'roles') };
  const communityLinks = (skillsRoot, sources) => planCommunitySkills({
    communityDir: path.join(repoDir, 'community-skills'), workflowSkills: skills, skillsRoot, sources,
  });
  const planAgents = async (ids, agentCtx) => {
    const groups = [];
    let usesSharedSkills = false;
    for (const adapter of await loadAdapters(ids)) {
      const actions = adapter.plan(agentCtx);
      if (adapter.projectSkillsDir) actions.push(...communityLinks(path.join(root, adapter.projectSkillsDir)));
      else usesSharedSkills = true;
      groups.push({ label: adapter.label, actions });
    }
    return { groups, usesSharedSkills };
  };
  const excludePath = path.join(gitDir, 'info', 'exclude');
  const ownExcluded = fs.existsSync(excludePath) ? readExcludeBlock(fs.readFileSync(excludePath, 'utf8')) : [];
  const keptAgents = readInstalledAgents(ownExcluded).filter((id) => PROJECT_TARGETS.includes(id) && !targets.includes(id));
  const selected = await planAgents(targets, ctx);
  // Los agentes que siguen instalados solo aportan sus rutas al bloque: sus avisos no se muestran.
  const kept = await planAgents(keptAgents, { ...ctx, warnings: [] });
  // .agents/skills se desinstala solo si ningún agente que sigue instalado la usa.
  const sharedSkillsOwner = args.uninstall
    ? (kept.usesSharedSkills ? kept : selected.usesSharedSkills && selected)
    : (selected.usesSharedSkills ? selected : kept.usesSharedSkills && kept);
  if (sharedSkillsOwner) {
    const skillsRoot = path.join(root, '.agents', 'skills');
    const actions = [...skillLinks(ctx, skillsRoot), ...communityLinks(skillsRoot, SHARED_COMMUNITY_SOURCES)];
    sharedSkillsOwner.groups.push({ label: 'Skills compartidas (.agents/skills)', actions });
  }
  const paths = [...selected.groups, ...kept.groups].flatMap((group) => group.actions.map((action) => action.path));
  const probe = createDiskProbe(root, listTrackedPaths(root, [...paths, excludePath]), ownExcluded);
  const agents = PROJECT_TARGETS.filter((id) => targets.includes(id) || keptAgents.includes(id));
  const planned = planProjectGroups(selected.groups, { root, excludePath, probe, kept: kept.groups, agents, keptAgents });
  // Al desinstalar los grupos se recorren al revés: la exclusión, primera, se revierte al final.
  const groups = args.uninstall ? [planned.pop(), ...planned] : planned;
  return { ctx, groups, displayRoot: { path: root, alias: '.' } };
}

function reportSkipped(groups) {
  const skipped = groups.flatMap((group) => group.actions).filter((action) => action.type === 'skip');
  if (!skipped.length) return;
  console.log('Omitidos (ya existían y no son de agent-workflow; no se tocaron ni se excluyeron):');
  for (const action of skipped) console.log(`  - ${action.path} (${action.reason})`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 11).join('\n').replaceAll('// ', ''));
    return;
  }
  const config = loadConfig();
  if (args.project && args.initOnly) throw new Error('--project y --init-only no se pueden combinar.');
  const { ctx, groups, displayRoot } = await selectGroups(args, config);

  const mode = args.uninstall ? 'DESINSTALAR' : 'INSTALAR';
  console.log(`\nagent-workflow · ${mode} · ${args.apply ? 'aplicando cambios' : 'SIMULACIÓN (no se toca nada)'}`);
  console.log(`Repo: ${repoDir}\nDestino: ${displayRoot.path}\nSkills: ${ctx.skills.length} · Roles: ${ctx.roles.map((r) => r.name).join(', ')}\n`);

  const ordered = args.uninstall ? [...groups].reverse() : groups;
  let failures = 0;
  for (const group of ordered) {
    console.log(`■ ${group.label}`);
    for (const action of args.uninstall ? [...group.actions].reverse() : group.actions) {
      const line = `  ${describe(action).replace(displayRoot.path, displayRoot.alias)}`;
      if (!args.apply) { console.log(line); continue; }
      try {
        const result = args.uninstall ? revert(action) : apply(action);
        console.log(`${line}  · ${result}`);
      } catch (error) {
        failures += 1;
        console.log(`${line}  · ERROR: ${error.message}`);
      }
    }
    console.log('');
  }
  for (const warning of ctx.warnings) console.log(`⚠ ${warning}`);
  reportSkipped(groups);
  if (!args.apply) console.log('Nada fue modificado. Para aplicar, repetí el comando con --apply.');
  else console.log(failures ? `Terminó con ${failures} error(es).` : 'Listo.');
  process.exitCode = failures ? 1 : 0;
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});

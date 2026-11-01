#!/usr/bin/env node
// Instalador de agent-workflow.
//
//   node scripts/install.mjs                 → simula (muestra qué haría, no toca nada)
//   node scripts/install.mjs --apply         → instala
//   node scripts/install.mjs --uninstall     → simula la desinstalación (agregá --apply para hacerla)
//   node scripts/install.mjs --only claude,opencode
//
// Las skills y roles se enlazan (junctions) a este repo: después de un `git pull` ya están
// actualizados. Volvé a correr el instalador solo si cambiaron core/, roles/ o se agregó una skill.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadRoles, loadSkillNames } from './lib.mjs';
import { apply, describe, revert } from './actions.mjs';

const repoDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function parseArgs(argv) {
  const args = { apply: false, uninstall: false, only: null, home: os.homedir() };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--apply') args.apply = true;
    else if (arg === '--uninstall') args.uninstall = true;
    else if (arg === '--only') args.only = argv[++i].split(',').map((s) => s.trim());
    else if (arg === '--home') args.home = path.resolve(argv[++i]);
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
  const actions = [{ type: 'link', path: ctx.hubDir, target: ctx.repoDir }];
  for (const skill of ctx.skills) {
    actions.push({ type: 'link', path: path.join(ctx.home, '.agents', 'skills', skill), target: path.join(ctx.repoDir, 'skills', skill) });
  }
  return actions;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 9).join('\n').replaceAll('// ', ''));
    return;
  }
  const config = loadConfig();
  const targets = args.only ?? config.targets;
  const ctx = {
    repoDir,
    home: args.home,
    hubDir: path.join(args.home, '.agents', 'agent-workflow'),
    skills: loadSkillNames(repoDir),
    roles: loadRoles(repoDir),
    models: config.models ?? {},
    warnings: [],
  };

  const groups = [{ label: 'Base común (~/.agents)', actions: hubActions(ctx) }];
  for (const adapter of await loadAdapters(targets)) groups.push({ label: adapter.label, actions: adapter.plan(ctx) });

  const mode = args.uninstall ? 'DESINSTALAR' : 'INSTALAR';
  console.log(`\nagent-workflow · ${mode} · ${args.apply ? 'aplicando cambios' : 'SIMULACIÓN (no se toca nada)'}`);
  console.log(`Repo: ${repoDir}\nHome: ${ctx.home}\nSkills: ${ctx.skills.length} · Roles: ${ctx.roles.map((r) => r.name).join(', ')}\n`);

  const ordered = args.uninstall ? [...groups].reverse() : groups;
  let failures = 0;
  for (const group of ordered) {
    console.log(`■ ${group.label}`);
    for (const action of args.uninstall ? [...group.actions].reverse() : group.actions) {
      const line = `  ${describe(action).replace(ctx.home, '~')}`;
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
  if (!args.apply) console.log('Nada fue modificado. Para aplicar, repetí el comando con --apply.');
  else console.log(failures ? `Terminó con ${failures} error(es).` : 'Listo.');
  process.exitCode = failures ? 1 : 0;
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});

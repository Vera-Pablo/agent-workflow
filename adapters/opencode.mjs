// OpenCode: instrucciones en ~/.config/opencode/AGENTS.md y agentes con permisos reales en
// ~/.config/opencode/agents. Las skills las lee de forma nativa desde ~/.agents/skills.
// En modo proyecto: .opencode/agent-workflow.md, .opencode/opencode.json y .opencode/agents.
import path from 'node:path';
import { GENERATED_NOTE, buildGeneratedRules, buildGlobalInstructions, yamlString } from '../scripts/lib.mjs';

const GIT_READ = { 'git status*': 'allow', 'git diff*': 'allow', 'git log*': 'allow', 'git show*': 'allow' };

function editPermission(edit) {
  if (edit === 'none') return 'deny';
  if (edit === 'task-files' || edit === undefined) return 'allow';
  const globs = Array.isArray(edit) ? edit : [edit];
  return { '*': 'deny', ...Object.fromEntries(globs.map((glob) => [glob, 'allow'])) };
}

function bashPermission({ bash, commit }) {
  const rules = { '*': bash === 'checks' ? 'ask' : 'deny', ...GIT_READ };
  if (commit === 'after-approval') Object.assign(rules, { 'git add*': 'ask', 'git commit*': 'ask', 'git push*': 'ask' });
  else Object.assign(rules, { 'git commit*': 'deny', 'git push*': 'deny' });
  return rules;
}

function toYaml(key, value, indent = '') {
  if (typeof value !== 'object') return `${indent}${key}: ${value}`;
  const lines = Object.entries(value).map(([k, v]) => toYaml(JSON.stringify(k), v, `${indent}  `));
  return [`${indent}${key}:`, ...lines].join('\n');
}

const PROJECT_RULES = 'agent-workflow.md';

/** En el proyecto las reglas van en un archivo propio que opencode.json declara en `instructions`. */
function projectRules(ctx, base) {
  const configPath = path.join(base, 'opencode.json');
  return [
    {
      type: 'file',
      path: path.join(base, PROJECT_RULES),
      content: buildGeneratedRules(ctx),
      requires: { path: configPath, reason: 'OpenCode no lo cargaría sin opencode.json' },
    },
    {
      type: 'json-ensure',
      path: configPath,
      ensure: { instructions: [`.opencode/${PROJECT_RULES}`] },
      summary: 'cargar las reglas de agent-workflow',
      removeIfEmpty: true,
      // Uno preexistente es del proyecto: no se modifica ni se oculta de git.
      createOnly: true,
    },
  ];
}

export default {
  id: 'opencode',
  label: 'OpenCode',
  plan(ctx) {
    const isProject = ctx.scope === 'project';
    const base = isProject ? path.join(ctx.root, '.opencode') : path.join(ctx.root, '.config', 'opencode');
    const models = ctx.models.opencode ?? {};
    const actions = isProject ? projectRules(ctx, base) : [
      { type: 'block', path: path.join(base, 'AGENTS.md'), content: buildGlobalInstructions(ctx) },
    ];
    for (const role of ctx.roles) {
      const permissions = role.permissions ?? {};
      const model = models[role.tier];
      const frontmatter = [
        '---',
        `description: ${yamlString(role.description)}`,
        `mode: ${role.mode}`,
        model ? `model: ${model}` : null,
        'permission:',
        toYaml('edit', editPermission(permissions.edit), '  '),
        toYaml('bash', bashPermission(permissions), '  '),
        '---',
      ].filter(Boolean).join('\n');
      actions.push({
        type: 'file',
        path: path.join(base, 'agents', `${role.name}.md`),
        content: `${frontmatter}\n${GENERATED_NOTE}\n\n${role.body}`,
      });
    }
    return actions;
  },
};

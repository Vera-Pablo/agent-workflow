// OpenCode: instrucciones en ~/.config/opencode/AGENTS.md y agentes con permisos reales en
// ~/.config/opencode/agents. Las skills las lee de forma nativa desde ~/.agents/skills.
import path from 'node:path';
import { GENERATED_NOTE, buildGlobalInstructions, yamlString } from '../scripts/lib.mjs';

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

export default {
  id: 'opencode',
  label: 'OpenCode',
  plan(ctx) {
    const base = path.join(ctx.home, '.config', 'opencode');
    const models = ctx.models.opencode ?? {};
    const actions = [
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

// Bob (solo modo proyecto): reglas en .bob/rules/agent-workflow.md y skills en .bob/skills.
import path from 'node:path';
import { buildGeneratedRules, requireProjectScope, skillLinks } from '../scripts/lib.mjs';

const LABEL = 'Bob';

export default {
  id: 'bob',
  label: LABEL,
  projectSkillsDir: path.join('.bob', 'skills'),
  plan(ctx) {
    requireProjectScope(ctx, LABEL);
    return [
      { type: 'file', path: path.join(ctx.root, '.bob', 'rules', 'agent-workflow.md'), content: buildGeneratedRules(ctx) },
      ...skillLinks(ctx, path.join(ctx.root, this.projectSkillsDir)),
    ];
  },
};

// Qwen Code (solo modo proyecto): reglas en el bloque administrado de .qwen/QWEN.local.md y
// skills en .qwen/skills.
import path from 'node:path';
import { buildGlobalInstructions, requireProjectScope, skillLinks } from '../scripts/lib.mjs';

const LABEL = 'Qwen Code';

export default {
  id: 'qwen',
  label: LABEL,
  projectSkillsDir: path.join('.qwen', 'skills'),
  plan(ctx) {
    requireProjectScope(ctx, LABEL);
    return [
      { type: 'block', path: path.join(ctx.root, '.qwen', 'QWEN.local.md'), content: buildGlobalInstructions(ctx) },
      ...skillLinks(ctx, path.join(ctx.root, this.projectSkillsDir)),
    ];
  },
};

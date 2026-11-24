// Kimi Code (solo modo proyecto): reglas en .kimi-code/AGENTS.md solo si no existe; las
// skills, en .agents/skills. Sin roles.
import path from 'node:path';
import { buildGeneratedRules, requireProjectScope } from '../scripts/lib.mjs';

const LABEL = 'Kimi Code';

export default {
  id: 'kimi',
  label: LABEL,
  plan(ctx) {
    requireProjectScope(ctx, LABEL);
    return [{ type: 'file', path: path.join(ctx.root, '.kimi-code', 'AGENTS.md'), content: buildGeneratedRules(ctx) }];
  },
};

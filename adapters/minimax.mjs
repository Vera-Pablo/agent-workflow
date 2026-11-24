// MiniMax (solo modo proyecto): solo usa .agents/skills; sus reglas solo se leen de AGENTS.md versionado.
import { SKILLS_ONLY_NOTICE, requireProjectScope } from '../scripts/lib.mjs';

const LABEL = 'MiniMax';

export default {
  id: 'minimax',
  label: LABEL,
  plan(ctx) {
    requireProjectScope(ctx, LABEL);
    ctx.warnings.push(`${LABEL}: ${SKILLS_ONLY_NOTICE}`);
    return [];
  },
};

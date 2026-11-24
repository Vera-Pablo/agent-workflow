// Google Antigravity: reglas globales en ~/.gemini/GEMINI.md (límite 12.000 caracteres) y
// skills en ~/.gemini/config/skills. Trabaja en modo un solo agente (roles en secuencia).
import path from 'node:path';
import { buildGlobalInstructions } from '../scripts/lib.mjs';

export const RULES_LIMIT = 12000;

export default {
  id: 'antigravity',
  label: 'Antigravity',
  plan(ctx) {
    const content = buildGlobalInstructions(ctx);
    const actions = [
      { type: 'block', path: path.join(ctx.root, '.gemini', 'GEMINI.md'), content },
    ];
    for (const skill of ctx.skills) {
      actions.push({
        type: 'link',
        path: path.join(ctx.root, '.gemini', 'config', 'skills', skill),
        target: path.join(ctx.repoDir, 'skills', skill),
      });
    }
    if (content.length > RULES_LIMIT) {
      ctx.warnings.push(`Antigravity: las reglas globales tienen ${content.length} caracteres (límite ${RULES_LIMIT}).`);
    }
    return actions;
  },
};

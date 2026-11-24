// Google Antigravity: reglas globales en ~/.gemini/GEMINI.md (límite 12.000 caracteres) y
// skills en ~/.gemini/config/skills. Trabaja en modo un solo agente (roles en secuencia).
// En modo proyecto: reglas en .agents/rules/agent-workflow.md; las skills, en .agents/skills.
import path from 'node:path';
import { buildGeneratedRules, buildGlobalInstructions } from '../scripts/lib.mjs';

export const RULES_LIMIT = 12000;

export default {
  id: 'antigravity',
  label: 'Antigravity',
  plan(ctx) {
    if (ctx.scope === 'project') {
      const content = buildGeneratedRules(ctx);
      warnIfTooLong(ctx, content, 'del proyecto');
      return [{ type: 'file', path: path.join(ctx.root, '.agents', 'rules', 'agent-workflow.md'), content }];
    }
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
    warnIfTooLong(ctx, content, 'globales');
    return actions;
  },
};

function warnIfTooLong(ctx, content, scopeLabel) {
  if (content.length > RULES_LIMIT) {
    ctx.warnings.push(`Antigravity: las reglas ${scopeLabel} tienen ${content.length} caracteres (límite ${RULES_LIMIT}).`);
  }
}

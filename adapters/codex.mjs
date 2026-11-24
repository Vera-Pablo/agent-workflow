// Codex: instrucciones globales en ~/.codex/AGENTS.md. Lee las skills de forma nativa desde
// ~/.agents/skills. Trabaja en modo un solo agente (roles en secuencia).
// En modo proyecto solo usa .agents/skills: sus reglas solo se leen de AGENTS.md versionado.
import path from 'node:path';
import { SKILLS_ONLY_NOTICE, buildGlobalInstructions } from '../scripts/lib.mjs';

export default {
  id: 'codex',
  label: 'Codex',
  plan(ctx) {
    if (ctx.scope === 'project') {
      ctx.warnings.push(`Codex: ${SKILLS_ONLY_NOTICE}`);
      return [];
    }
    return [
      { type: 'block', path: path.join(ctx.root, '.codex', 'AGENTS.md'), content: buildGlobalInstructions(ctx) },
    ];
  },
};

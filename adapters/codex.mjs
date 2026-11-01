// Codex: instrucciones globales en ~/.codex/AGENTS.md. Lee las skills de forma nativa desde
// ~/.agents/skills. Trabaja en modo un solo agente (roles en secuencia).
import path from 'node:path';
import { buildGlobalInstructions } from '../scripts/lib.mjs';

export default {
  id: 'codex',
  label: 'Codex',
  plan(ctx) {
    return [
      { type: 'block', path: path.join(ctx.home, '.codex', 'AGENTS.md'), content: buildGlobalInstructions(ctx) },
    ];
  },
};

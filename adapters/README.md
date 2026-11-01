# Adaptadores

Cada adaptador traduce la base (constitución, roles, skills) al formato de un agente.
Exporta `{ id, label, plan(ctx) }`; `plan` devuelve acciones que ejecuta `scripts/install.mjs`.

| Adaptador | Instrucciones globales | Skills | Roles |
|---|---|---|---|
| `claude` | `~/.claude/CLAUDE.md` | `~/.claude/skills/*` (enlaces) | `~/.claude/agents/*.md` (subagentes) + confirmar commit/push |
| `opencode` | `~/.config/opencode/AGENTS.md` | nativo desde `~/.agents/skills` | `~/.config/opencode/agents/*.md` con permisos reales |
| `codex` | `~/.codex/AGENTS.md` | nativo desde `~/.agents/skills` | un solo agente, roles en secuencia |
| `copilot` | `~/.copilot/copilot-instructions.md` | nativo desde `~/.agents/skills` | `~/.copilot/agents/*.agent.md` |
| `antigravity` | `~/.gemini/GEMINI.md` | `~/.gemini/config/skills/*` (enlaces) | un solo agente, roles en secuencia |

Base común para todos: `~/.agents/agent-workflow` → este repo y `~/.agents/skills/*` → `skills/*`.

## Acciones
- `link`: enlace (junction en Windows, sin permisos de admin) hacia el repo.
- `file`: archivo generado (lleva la marca `generado por agent-workflow`).
- `block`: bloque administrado dentro de un archivo tuyo; tu contenido se conserva.
- `json-ensure`: agrega valores a un JSON sin tocar el resto.

Nada se borra: si algo ajeno ocupa un lugar, se renombra a `*.respaldo-<fecha>`.

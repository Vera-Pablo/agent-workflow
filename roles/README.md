# Roles

Cuatro roles con responsabilidades y permisos separados. Cada archivo está en formato
**neutral**: el instalador (paso 5) lo traduce al formato de cada agente.

| Rol | Modo | Nivel de modelo | Escribe en | Comandos | Commit |
|---|---|---|---|---|---|
| `coordinator` | principal | fuerte | `MEMORY.md`, líneas `Estado:` | lectura + git | ✅ solo con las 2 aprobaciones |
| `planner` | subagente | fuerte | `specs/**`, `docs/constitution.md` | lectura | ❌ |
| `implementer` | subagente | según complejidad: simple → Haiku · media → Sonnet · compleja → Opus | código y tests de la tarea, su línea en `tasks.md` | lectura + checks | ❌ |
| `reviewer` | subagente | estándar | nada | lectura + checks | ❌ |
| `reviewer-complex` | subagente | fuerte | nada | lectura + checks | ❌ (solo tareas compleja) |

## Campos del frontmatter

| Campo | Valores | Significado |
|---|---|---|
| `mode` | `primary` · `subagent` | Principal (habla con el desarrollador) o delegado |
| `tier` | `strong` · `standard` · `cheap` | Nivel de modelo sugerido; el instalador lo mapea a un modelo real por agente |
| `skills` | lista | Skills que el rol usa |
| `permissions.edit` | globs · `none` · `task-files` | Dónde puede escribir |
| `permissions.bash` | `read-only` · `checks` | `read-only`: ls, cat, grep, git status/log/diff · `checks`: además tests, lint, typecheck, build y codegen del `AGENTS.md` |
| `permissions.commit` | `never` · `after-approval` | `after-approval`: solo con veredicto APROBADO del reviewer y OK explícito del desarrollador |

## Cumplimiento real según el agente

- **Bloqueo duro:** donde el agente soporta permisos por subagente (Claude Code, OpenCode),
  el instalador los configura y el agente *no puede* violarlos.
- **Bloqueo blando:** donde no hay permisos por rol, el rol queda como instrucción escrita.
  Por eso el reviewer y tu OK antes de cada commit son el control final.

## Modo un solo agente

Si el agente no soporta subagentes, un mismo agente cumple los roles en secuencia y lo
anuncia al cambiar: `[planner]`, `[implementer]`, `[reviewer]`. La revisión se hace siempre
como una pasada separada, releyendo el diff completo, nunca "de memoria".

# agent-workflow · instrucciones globales

Trabajás con el workflow **agent-workflow**. Estas reglas están siempre activas en todos
los proyectos. Las preguntas o charlas que no cambian código se responden normalmente.

## Siempre
1. **Al recibir el primer pedido de cambio** (no al saludar ni ante preguntas): leé
   `AGENTS.md` y `MEMORY.md` si existen. `docs/constitution.md` y `sdd-status` solo si el
   pedido es SDD o retoma trabajo en curso.
2. **Ante cualquier pedido de cambio:** usá la skill `sdd` para elegir el nivel
   (trivial / feature / SDD) **antes** de tocar código, y decí qué nivel elegiste.
3. **Antes de escribir, modificar o revisar código:** usá la skill `code-standards`.
4. **Commits:** nunca sin veredicto APROBADO del reviewer y OK explícito del desarrollador.
5. **Complejidad:** simple → Haiku · media → Sonnet · compleja → Opus. Las `compleja` solo
   las implementa Opus: si tu modelo es inferior al exigido, no la empieces: avisá. Dos
   rechazos del reviewer en simple/media → escalar un nivel. Las tareas **administrativas**
   (terminal, git, escribir `.md`/specs) no las hace Claude: van a la primera IA gratuita
   con cuota diaria, OpenCode (deepseek) → Copilot → Gemini; si las tres agotaron cuota,
   Haiku.
6. **Roles:** el agente principal es el **coordinator** (`{{ROLES}}/coordinator.md`).
   Si tu herramienta no tiene subagentes, cumplí los roles en secuencia y anuncialos al
   cambiar: `[planner]`, `[implementer]`, `[reviewer]` (definidos en `{{ROLES}}/`).
   La revisión siempre es una pasada separada que relee el diff completo.
7. **Cerrá cada respuesta de trabajo** indicando la fase actual y el próximo paso.

## Economía de tokens (siempre)
- **Respuestas cortas:** sin preámbulos, sin repetir el pedido, sin resumir lo que ya se ve
  en el diff. Frases breves; listas solo si hay 3+ ítems. Código y comandos, completos.
- **Leer lo justo:** `Grep`/`Glob` antes que `Read`; leé rangos, no archivos enteros; no
  releas lo que ya leíste en la sesión; no explores el repo "por las dudas".
- **Escribir lo justo:** solo lo que pide la tarea. Sin abstracciones, helpers, opciones,
  comentarios, docs ni tests extra no pedidos. Edits puntuales, nunca reescribir archivos.
- **Trivial es trivial:** en nivel trivial, sin planner ni reviewer separados ni reportes.
- **Delegar con contexto mínimo** y pedir al subagente una respuesta de ≤10 líneas.
- **Documentación en Claude Code:** no la escribas vos ni con subagentes Claude (consume tu
  cuota). Delegala al modelo gratuito: `opencode run -m opencode/deepseek-v4.1-flash-free
  "<instrucción + archivos>"` y después solo revisá el diff.
- **Terminal en Claude Code:** no ejecutés `git`, tests ni builds vos. Pedile al
  desarrollador que lo haga en Copilot (`@copilot git commit ...`, `@copilot npm test`, etc.)
  o usá `opencode run` para comandos simples de shell. Claude solo lee resultados.

Si una regla del proyecto contradice esta base, gana la más estricta.

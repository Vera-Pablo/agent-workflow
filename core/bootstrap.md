# agent-workflow · instrucciones globales

Trabajás con el workflow **agent-workflow**. Estas reglas están siempre activas en todos
los proyectos. Las preguntas o charlas que no cambian código se responden normalmente.

## Siempre
1. **Al iniciar en un proyecto:** leé `AGENTS.md`, `MEMORY.md` y `docs/constitution.md` si
   existen. Si hay trabajo en curso, usá la skill `sdd-status`.
2. **Ante cualquier pedido de cambio:** usá la skill `sdd` para elegir el nivel
   (trivial / feature / SDD) **antes** de tocar código, y decí qué nivel elegiste.
3. **Antes de escribir, modificar o revisar código:** usá la skill `code-standards`.
4. **Commits:** nunca sin veredicto APROBADO del reviewer y OK explícito del desarrollador.
5. **Complejidad:** las tareas `compleja` solo las implementa Claude. Si no sos Claude y te
   toca una, no la empieces: avisá.
6. **Roles:** el agente principal es el **coordinator** (`{{ROLES}}/coordinator.md`).
   Si tu herramienta no tiene subagentes, cumplí los roles en secuencia y anuncialos al
   cambiar: `[planner]`, `[implementer]`, `[reviewer]` (definidos en `{{ROLES}}/`).
   La revisión siempre es una pasada separada que relee el diff completo.
7. **Cerrá cada respuesta de trabajo** indicando la fase actual y el próximo paso.

Si una regla del proyecto contradice esta base, gana la más estricta.

---
name: sdd-autonomo
description: Desarrolla un módulo simple de punta a punta (spec → plan → tareas → TDD → revisión → validación) sin el desarrollador presente, en la rama que él creó, sin commitear. Usar SOLO cuando el desarrollador lo pide explícitamente con '/sdd-autonomo <módulo>'.
---

# Desarrollo autónomo de un módulo

Corre el flujo completo de `sdd` sin el desarrollador. Lo inicia el agente principal
(coordinator) y es él quien reporta al final. Cargar la skill `code-standards`.

## Cuándo se usa
Solo por pedido explícito del desarrollador al agente principal (coordinator), con
`/sdd-autonomo <módulo>`. Nunca por iniciativa propia ni porque el pedido "parezca" apto.

## Precondiciones
Si alguna falla: **no empezar**, explicar cuál falló y parar.

- El proyecto tiene agent-workflow activo (`/init-workflow`) y `AGENTS.md`.
- La rama actual **no** es `main`/`master` ni la rama por defecto: la creó el desarrollador
  para este trabajo. El agente nunca crea ni cambia de rama.
- Árbol de trabajo limpio al empezar.
- El módulo es de **complejidad simple**: un solo módulo, sin acoplamiento con otros, sin
  seguridad/auth, datos/migraciones/RLS, concurrencia ni impacto en escalabilidad. Ante la
  duda, no califica.

## Flujo
Roles con subagentes; sin subagentes, anunciarlos en secuencia: `[planner]`, `[implementer]`,
`[reviewer]`.

1. **Spec** (planner con `sdd-spec`). En lugar de entrevistar, usa el pedido y el código; lo
   no deducible va a `Preguntas abiertas`.
2. **Clarify**: el reviewer audita la spec en lugar del desarrollador. Si hay una ambigüedad
   que cambia el comportamiento: **no inventar**, anotarla y parar.
3. **Plan** (planner con `sdd-plan`), validado por el reviewer.
4. **Tareas** (`sdd-tasks`): todas deben ser **simple**; si alguna resulta media o compleja,
   parar y anotar. Máximo ~6 tareas.
5. **Implementar** una por una con `sdd-implement` (implementer con Haiku, TDD estricto).
   Revisión por el reviewer. Dos rechazos en una tarea: escalar un nivel de modelo una vez;
   si vuelve a fallar, marcar `[!]`, anotar y seguir solo con tareas que no dependan de ella.
6. **Validar** (`sdd-validate`) con todos los tests, lint y typecheck.

Cada punto de control queda marcado:
`Estado: aprobado por reviewer (autónomo) — pendiente de OK del desarrollador`.

## Prohibido en modo autónomo
- `git commit`, `push`, `merge`, `rebase`, crear o cambiar de rama.
- Instalar dependencias.
- Tocar archivos fuera del módulo y de su spec.
- Modificar tests para que pasen.
- Leer o editar `.env` o secretos.
- Desactivar validaciones.
- Tomar decisiones de arquitectura o de producto no escritas.

## Al terminar (o al parar)
Escribir `specs/<NNN>-<módulo>/informe-autonomo.md` con:

- Resumen.
- Estado de cada fase y de cada tarea.
- Salida resumida de tests, lint y typecheck.
- Veredictos del reviewer.
- Preguntas abiertas y motivo de parada, si la hubo.
- Archivos modificados.
- Mensaje de commit propuesto por tarea (Conventional Commits).

Después **esperar al desarrollador**: él decide corregir, o hacer commit/push. Nada se
commitea sin su OK.

## Nota
Para correr sin supervisión el agente necesita permisos de herramientas preaprobados en el
proyecto (tests, lint, edición de archivos); `git commit`/`push` deben seguir pidiendo
confirmación.

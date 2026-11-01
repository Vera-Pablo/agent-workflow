---
name: sdd-change
description: Gestiona un cambio de requisitos sobre una spec existente actualizando primero spec.md y luego plan y tareas afectados. Usar cuando el desarrollador cambia de idea, aparece un requisito nuevo o se descubre que la spec estaba mal.
---

# Gestionar un cambio

Regla de oro: **la spec cambia primero.** Nunca se cambia código que contradiga la spec vigente.

## Pasos
1. Identificar la spec afectada y su fase actual.
2. Analizar el impacto y presentarlo: requisitos nuevos / modificados / eliminados, partes
   del plan afectadas, tareas hechas que habría que rehacer, tests que cambian.
3. Si el cambio es grande o es otra funcionalidad: proponer una spec nueva en lugar de
   modificar esta.
4. Con el OK del desarrollador:
   - Actualizar `spec.md` (marcar requisitos modificados con `(modificado AAAA-MM-DD)`).
   - Volver a `sdd-clarify` si el cambio introduce dudas.
   - Actualizar `plan.md` y `tasks.md`; las tareas a rehacer vuelven a `[ ]`.
5. Registrar el cambio y su motivo en `MEMORY.md`.
6. Continuar con `sdd-implement`.

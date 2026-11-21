---
name: sdd-implement
description: Implementa UNA sola tarea de tasks.md aplicando TDD, la somete a revisión y la commitea solo con aprobación del reviewer y OK del desarrollador. Usar para avanzar tareas de una spec o feature aprobada.
---

# Implementar una tarea

Fase 5 del flujo (ver skill `sdd`). **Una tarea por vez.** Cargar la skill `code-standards`.

## Antes
1. Elegir la primera tarea `[ ]` cuyas dependencias estén `[x]` (o la que indique el desarrollador).
2. Leer la tarea, los requisitos que cubre, el plan y `MEMORY.md`. Marcar `[~]`.
3. Respetar la complejidad de la tarea: simple → **Haiku** · media → **Sonnet** ·
   compleja → **Opus**. Si tu modelo es inferior al exigido, avisá y no empieces.
4. Verificar que el proyecto está en verde (tests y análisis) antes de tocar nada.

## TDD
5. **Rojo:** escribir el test indicado en la tarea. Ejecutarlo y confirmar que falla por la
   razón correcta.
6. **Verde:** código mínimo para pasar. Reutilizar lo que el plan indicó.
7. **Refactor:** limpiar con los tests en verde.
8. Correr **todos** los tests, linter y typecheck del proyecto.

## Revisión
9. Marcar `[r]` y completar el campo **Entrega** de la tarea: archivos, resultado de checks y
   mensaje de commit propuesto (con `Refs: NNN/T-xx`).
   - Si quien implementó **no es el agente principal** (ej. un modelo gratuito en otra
     herramienta): su trabajo termina acá. No pide OK ni commitea.
10. Pedir revisión: si existe el rol/subagente `reviewer`, delegarle; si no, una pasada separada
    siguiendo `code-standards/references/review.md`.
    **Revisión cruzada:** lo que implementó un modelo `cheap`/gratuito lo revisa Claude.
11. Si el veredicto es CAMBIOS REQUERIDOS: corregir y volver al paso 8.

## Commit (agente principal, con las dos aprobaciones)
12. Presentar al desarrollador: resumen, archivos, checks, veredicto del reviewer y el mensaje
    de commit del campo Entrega.
13. **Esperar su OK explícito.** Recién entonces: marcar `[x]` y commitear los archivos de la
    tarea **más** su `tasks.md`/`feature.md`, agregándolos por nombre.
14. Actualizar `MEMORY.md` si hubo una decisión o aprendizaje.

## Prohibido
Avanzar a otra tarea en la misma pasada, tocar archivos fuera de la tarea, modificar tests
para que pasen, commitear sin las dos aprobaciones. Si la tarea resulta mal definida o más
grande de lo previsto: marcar `[!]`, explicar y proponer el ajuste.

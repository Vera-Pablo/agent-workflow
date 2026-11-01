---
name: sdd-implement
description: Implementa UNA sola tarea de tasks.md aplicando TDD, la somete a revisión y la commitea solo con aprobación del reviewer y OK del desarrollador. Usar para avanzar tareas de una spec o feature aprobada.
---

# Implementar una tarea

Fase 5 del flujo (ver skill `sdd`). **Una tarea por vez.** Cargar la skill `code-standards`.

## Antes
1. Elegir la primera tarea `[ ]` cuyas dependencias estén `[x]` (o la que indique el desarrollador).
2. Leer la tarea, los requisitos que cubre, el plan y `MEMORY.md`. Marcar `[~]`.
3. Verificar que el proyecto está en verde (tests y análisis) antes de tocar nada.

## TDD
4. **Rojo:** escribir el test indicado en la tarea. Ejecutarlo y confirmar que falla por la
   razón correcta.
5. **Verde:** código mínimo para pasar. Reutilizar lo que el plan indicó.
6. **Refactor:** limpiar con los tests en verde.
7. Correr **todos** los tests, linter y typecheck del proyecto.

## Revisión
8. Marcar `[r]` y pedir revisión: si existe el rol/subagente `reviewer`, delegarle;
   si no, hacer una pasada de revisión separada siguiendo `code-standards/references/review.md`.
9. Si el veredicto es CAMBIOS REQUERIDOS: corregir y volver al paso 7.

## Commit (solo con las dos aprobaciones)
10. Presentar al desarrollador: resumen del cambio, archivos tocados, resultado de checks,
    veredicto del reviewer y mensaje de commit propuesto.
11. **Esperar su OK explícito.** Recién entonces: commit con solo los archivos de la tarea.
12. Marcar `[x]` y actualizar `MEMORY.md` si hubo una decisión o aprendizaje.

## Prohibido
Avanzar a otra tarea en la misma pasada, tocar archivos fuera de la tarea, modificar tests
para que pasen, commitear sin las dos aprobaciones. Si la tarea resulta mal definida o más
grande de lo previsto: marcar `[!]`, explicar y proponer el ajuste.

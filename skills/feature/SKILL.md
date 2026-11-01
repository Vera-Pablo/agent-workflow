---
name: feature
description: Flujo liviano para cambios acotados (hasta 3 tareas, sin decisiones de arquitectura ni de datos): plan corto, tareas con TDD, revisión y commit con OK. Usar para mejoras o arreglos medianos que no justifican una spec completa.
---

# Feature (flujo liviano)

Nivel intermedio del flujo (ver skill `sdd`). Si durante el análisis aparece una decisión de
arquitectura, un cambio de esquema/datos o más de 3 tareas: **parar y pasar a SDD**.

## Pasos
1. Leer `AGENTS.md`, `MEMORY.md` y la skill `code-standards`.
2. Hacer las preguntas mínimas para fijar objetivo y criterios de aceptación.
3. Buscar en el código qué se puede reutilizar.
4. Crear `specs/NNN-slug/feature.md` con la plantilla `../sdd/assets/feature.md`.
5. Mostrarlo y **esperar el OK del desarrollador**.
6. Implementar cada tarea con el mismo ciclo que `sdd-implement`: TDD → checks → revisión
   → OK del desarrollador → commit. Una tarea por vez.
7. Al terminar: verificar los criterios de aceptación, `Estado: hecha`, actualizar `MEMORY.md`.

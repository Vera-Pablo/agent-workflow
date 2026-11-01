---
name: sdd-clarify
description: Audita una spec.md como QA buscando ambigüedades, contradicciones, huecos y requisitos no verificables, y la cierra con el desarrollador hasta aprobarla. Usar después de sdd-spec o ante una spec dudosa.
---

# Clarificar

Fase 2 del flujo (ver skill `sdd`). Objetivo: que la spec no admita dos interpretaciones.

## Auditoría
Revisar la spec y listar hallazgos de estos tipos:
- **Ambiguo:** palabras vagas ("rápido", "varios", "etc."), sujetos poco claros.
- **Contradicción:** requisitos que chocan entre sí, con otra spec o con la constitución.
- **Hueco:** casos borde, errores, permisos, estados vacíos, concurrencia u offline sin cubrir.
- **No verificable:** requisito sin criterio de aceptación o con criterio no medible.
- **Fuera de lugar:** detalles de implementación (pasan al plan).
- **Pregunta abierta** sin responder.

## Pasos
1. Presentar los hallazgos numerados, con una pregunta concreta y, si ayuda, opciones.
2. Con las respuestas, actualizar la spec. Preguntas resueltas → requisitos o criterios.
3. Repetir hasta que no queden hallazgos ni preguntas abiertas.
4. Pedir al desarrollador el **OK para aprobar la spec**. Con el OK: `Estado: aprobada`
   y registrar la decisión en `MEMORY.md`.

## Al terminar
Próximo paso: `sdd-plan`.

---
name: sdd-spec
description: Entrevista al desarrollador y redacta la especificación (spec.md) de una funcionalidad nueva con requisitos EARS y criterios de aceptación. Usar cuando se pide una funcionalidad de nivel SDD o un "/sdd-spec".
---

# Especificar

Fase 1 del flujo (ver skill `sdd`). Se define **qué** y **por qué**, nunca **cómo**.

## Pasos
1. Leer `AGENTS.md`, `MEMORY.md`, `docs/constitution.md` y las specs relacionadas en `specs/`.
2. Si hay requisitos del proyecto (ej. `docs/requerimientos.md`), ubicar los IDs que aplican.
3. **Entrevistar** con preguntas concretas, de a 3-5 por vez, hasta poder responder:
   problema, usuarios, alcance (qué incluye y qué no), comportamientos esperados, errores y
   casos borde, datos involucrados, restricciones.
4. Crear `specs/NNN-slug/spec.md` con la plantilla `assets/spec.md` de la skill `sdd`
   (`../sdd/assets/spec.md`). NNN = siguiente número libre.
5. Requisitos en EARS (ver `../sdd/references/ears.md`). Cada requisito con al menos un
   criterio de aceptación.
6. Lo que no se pudo cerrar va a **Preguntas abiertas**. No inventar respuestas.
7. Si supera ~150 líneas o más de ~10 requisitos: proponer dividir en varias specs.

## Prohibido en una spec
Nombres de archivos, clases, funciones, librerías o pseudocódigo. Eso es del plan.

## Al terminar
Estado `borrador`. Próximo paso: `sdd-clarify`.

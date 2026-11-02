---
name: sdd
description: Orquesta el flujo de trabajo del proyecto (trivial / feature / Spec-Driven Development). Usar al iniciar cualquier pedido de cambio para elegir el nivel, saber en qué fase está una spec y qué paso sigue. Define puntos de control, archivos y reglas comunes a todas las fases sdd-*.
---

# Flujo de trabajo

## 1. Elegir el nivel (siempre primero)

| Nivel | Cuándo | Qué hacer |
|---|---|---|
| **Trivial** | Typo, estilo, renombre local, sin lógica nueva | Cambio directo → checks → revisión → OK del desarrollador → commit |
| **Feature** | Acotado (≤ 3 tareas), sin decisiones de arquitectura ni de datos | Skill `feature` |
| **SDD** | Funcionalidad nueva, varias capas, reglas de negocio, cambios de datos | Fases de abajo |

Ante la duda, el nivel más alto. Decile al desarrollador qué nivel elegiste y por qué.

## 2. Fases SDD

| # | Fase | Skill | Produce | Punto de control |
|---|---|---|---|---|
| 0 | Constitución | `sdd-constitution` | `docs/constitution.md` | OK del desarrollador (una vez por proyecto) |
| 1 | Especificar | `sdd-spec` | `specs/NNN-slug/spec.md` | — |
| 2 | Clarificar | `sdd-clarify` | spec sin ambigüedades | **OK del desarrollador → spec aprobada** |
| 3 | Planificar | `sdd-plan` | `plan.md` | **OK del desarrollador** |
| 4 | Desglosar | `sdd-tasks` | `tasks.md` | **OK del desarrollador** |
| 5 | Implementar | `sdd-implement` | código + tests, 1 tarea a la vez | **Reviewer + OK del desarrollador → commit** |
| 6 | Validar | `sdd-validate` | informe requisito por requisito | **OK del desarrollador → spec validada** |
| — | Cambio | `sdd-change` | spec actualizada primero | Vuelve a la fase que corresponda |
| — | Estado | `sdd-status` | resumen y próximo paso | — |

**Nunca se saltea una fase ni un punto de control.** Sin spec aprobada no hay plan;
sin plan aprobado no hay tareas; sin tarea aprobada no hay código.

## 3. Archivos

```
specs/NNN-slug/        NNN = número correlativo de 3 dígitos, slug en kebab-case
├── spec.md            qué y por qué       (plantilla: assets/spec.md)
├── plan.md            cómo                (plantilla: assets/plan.md)
└── tasks.md           tareas y su estado  (plantilla: assets/tasks.md)
```

Cada archivo empieza con una línea `Estado:` que es la fuente de verdad de la fase:
- spec: `borrador → aprobada → implementando → validada`
- plan / tasks: `borrador → aprobado`
- tarea: `[ ]` pendiente · `[~]` en curso · `[r]` en revisión · `[x]` hecha · `[!]` bloqueada

## 4. Reglas comunes a todas las fases

- Antes de empezar: leer `AGENTS.md`, `MEMORY.md` y `docs/constitution.md` del proyecto.
- Las fases que tocan código cargan la skill `code-standards`.
- **Límites de tamaño:** spec ≤ ~150 líneas, plan ≤ ~150, ≤ 12 tareas. Si se excede,
  la funcionalidad es demasiado grande: dividirla en varias specs.
- Trazabilidad: requisitos `R-01`, criterios `CA-01`, tareas `T-01`. Las tareas citan los
  requisitos que cubren y los commits citan la tarea (`Refs: 003/T-02`).
- Al terminar cada sesión o decisión relevante: actualizar `MEMORY.md`
  (ver `references/memory.md`).
- Si algo no está claro: preguntar. No inventar requisitos, APIs ni datos.
- Terminar cada respuesta indicando **en qué fase estamos y cuál es el próximo paso**.

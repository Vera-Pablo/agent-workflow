# specs/

Especificaciones vivas del proyecto (Spec-Driven Development de agent-workflow).

```
specs/NNN-slug/       NNN = número correlativo de 3 dígitos · slug en kebab-case
├── spec.md           qué y por qué (requisitos EARS + criterios de aceptación)
├── plan.md           cómo (reutilización, cambios por capa, tests)
├── tasks.md          tareas de 20-30 min con su estado y complejidad
└── feature.md        (solo nivel feature: plan corto + hasta 3 tareas)
```

Cada archivo empieza con `Estado:`. Para saber dónde está el trabajo: skill `status`.
Límites: spec y plan ≤ ~150 líneas, ≤ 12 tareas. Si no alcanza, dividir en varias specs.

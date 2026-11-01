# agent-workflow

Workflow profesional y portable para agentes de código (Claude Code, OpenCode, Antigravity, Copilot, Codex).
Objetivo: flujo sólido, buenas prácticas y código legible. Nada de vibe coding.

## Dos capas

| Capa | Dónde vive | Qué contiene |
|---|---|---|
| **Base (este repo)** | Se instala de forma global para cada agente | Constitución, estándares, skills del flujo, roles, plantillas |
| **Proyecto** | En cada repo | `AGENTS.md`, `MEMORY.md`, `docs/constitution.md`, `specs/`, skills de dominio, MCP |

Un proyecto puede **agregar** reglas a la base, nunca **relajarlas**.

## Estructura

```
agent-workflow/
├── core/
│   └── constitution.md        # Principios innegociables (todos los proyectos)
├── skills/                    # Skills portables (estándar Agent Skills, SKILL.md)
│   ├── code-standards/        # Estándares de código + referencias por tema
│   ├── sdd/                   # Orquestador: niveles, fases, puntos de control, plantillas
│   ├── sdd-constitution, sdd-spec, sdd-clarify, sdd-plan, sdd-tasks,
│   │   sdd-implement, sdd-validate, sdd-change   # Fases del flujo SDD
│   ├── feature/               # Flujo liviano (≤ 3 tareas)
│   └── status/                # Estado y próximo paso
├── roles/                     # Roles: coordinator, planner, implementer, reviewer  (paso 4)
├── templates/                 # Plantillas de la capa de proyecto                  (paso 6)
├── adapters/                  # Generadores por agente                             (paso 5)
└── scripts/                   # install / sync (Node.js)                           (paso 5)
```

## Estado

- [x] Paso 2 · Constitución y estándares de código
- [x] Paso 3 · Skills del flujo (trivial / feature / SDD)
- [ ] Paso 4 · Roles y permisos
- [ ] Paso 5 · Instalador para cada agente
- [ ] Paso 6 · `/init-project` y plantillas
- [ ] Paso 7 · Migración de proyectos
- [ ] Paso 8 · Prueba real de punta a punta

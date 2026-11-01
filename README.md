# agent-workflow

**Un flujo de trabajo profesional para programar con agentes de IA, sin vibe coding.**

Este repo define *cómo* trabajan los agentes de código (Claude Code, OpenCode, Antigravity,
Copilot, Codex) en cualquier proyecto: qué principios respetan, qué estándares de código
cumplen, en qué fases avanzan y en qué momentos se detienen a esperar la aprobación del
desarrollador.

La idea central: **el agente nunca decide solo qué construir ni da algo por terminado sin vos.**
Toda funcionalidad pasa por especificación, plan, tareas chicas con TDD, revisión de un
reviewer y tu OK antes de cada commit. Como el estado vive en archivos, podés empezar con un
agente y continuar con otro sin perder el hilo.

## Qué incluye

- **Constitución:** principios innegociables (TDD, tipado estricto, reutilizar antes de crear,
  consultas precisas, clean code, un commit por tarea con doble aprobación).
- **Estándares de código:** referencias concretas por tema (legibilidad, tests, tipos, datos,
  commits, revisión).
- **Skills del flujo:** Spec-Driven Development completo, un flujo liviano para cambios
  medianos y un comando de estado. Siguen el estándar abierto Agent Skills, así que funcionan
  en distintos agentes.
- **Roles con permisos:** coordinator, planner, implementer y reviewer, cada uno con lo que
  puede y no puede hacer.

## Dos capas

| Capa | Dónde vive | Qué contiene |
|---|---|---|
| **Base (este repo)** | Se instala de forma global para cada agente | Constitución, estándares, skills del flujo, roles, plantillas |
| **Proyecto** | En cada repo | `AGENTS.md`, `MEMORY.md`, `docs/constitution.md`, `specs/`, skills de dominio, MCP |

Un proyecto puede **agregar** reglas a la base, nunca **relajarlas**.

## Cómo trabaja

Cada pedido se clasifica en un nivel:

| Nivel | Cuándo | Flujo |
|---|---|---|
| **Trivial** | Typo, estilo, renombre local | Cambio directo → checks → revisión → OK → commit |
| **Feature** | Cambio acotado (≤ 3 tareas), sin decisiones de arquitectura ni datos | Plan corto → tareas con TDD → revisión → OK → commit |
| **SDD** | Funcionalidad nueva, reglas de negocio, varias capas o datos | Fases completas (ver ejemplo) |

Y cada tarea, según su complejidad, la implementa un modelo distinto:
**simple** → modelo gratuito · **media** → modelo estándar · **compleja** → Claude.

## Ejemplo del flujo

Pedido: *"Quiero poder registrar ventas a crédito."*

```
1. NIVEL         El coordinator lo clasifica como SDD: toca reglas de negocio y datos.

2. SPEC          El planner te entrevista (¿límite de crédito? ¿se puede anular?) y redacta
                 specs/004-ventas-credito/spec.md con requisitos verificables:
                   R-01 Si la venta es a crédito sin cliente, el sistema debe rechazarla.

3. CLARIFY       Audita su propia spec buscando ambigüedades y huecos.
                 🛑 Vos aprobás la spec.

4. PLAN          Busca qué código ya existe para reutilizar y diseña el cómo:
                 archivos por capa, funciones puras, consultas, estrategia de tests.
                 🛑 Vos aprobás el plan.

5. TAREAS        Divide el plan en tareas de 20-30 min, cada una con su complejidad:
                   T-01 Validar venta a crédito ............ compleja → Claude
                   T-02 Calcular saldo del cliente ......... compleja → Claude
                   T-03 Consultar saldo en repositorio ..... simple   → modelo gratuito
                   T-04 Selector de cliente en la pantalla . media    → modelo estándar
                 🛑 Vos aprobás las tareas.

6. IMPLEMENTAR   Una tarea por vez:
                   🔴 test que falla → 🟢 código mínimo → 🔧 refactor → todos los checks
                   → el reviewer revisa el diff (APROBADO / CAMBIOS REQUERIDOS)
                   → te muestra resumen, checks y mensaje de commit
                 🛑 Vos das OK → commit → siguiente tarea.

7. VALIDAR       Recorre cada requisito: qué test lo cubre y si se verificó funcionando.
                 🛑 Vos validás la spec. Listo.
```

Si a mitad de camino cambiás un requisito, primero se actualiza la spec y después el resto.
Si se corta la sesión o cambiás de agente, el comando `status` lee los archivos y te dice
exactamente dónde quedó y cuál es el próximo paso.

## Instalación

Requiere Node.js. Desde la carpeta del repo:

```powershell
node scripts/install.mjs            # simulación: muestra qué va a hacer
node scripts/install.mjs --apply    # instala para todos los agentes
```

Las skills quedan enlazadas al repo: un `git pull` las actualiza. Detalles en `scripts/README.md`.

## Usar en un proyecto

Abrí el proyecto con cualquier agente y pedí `/init-project` (o "inicializá este proyecto con
agent-workflow"). Analiza el código, te propone la capa de proyecto y la crea con tu OK.

## Estructura

```
agent-workflow/
├── core/
│   ├── bootstrap.md           # Reglas siempre activas que se instalan en cada agente
│   └── constitution.md        # Principios innegociables (todos los proyectos)
├── skills/                    # Skills portables (estándar Agent Skills, SKILL.md)
│   ├── code-standards/        # Estándares de código + referencias por tema
│   ├── sdd/                   # Orquestador: niveles, fases, puntos de control, plantillas
│   ├── sdd-constitution, sdd-spec, sdd-clarify, sdd-plan, sdd-tasks,
│   │   sdd-implement, sdd-validate, sdd-change   # Fases del flujo SDD
│   ├── feature/               # Flujo liviano (≤ 3 tareas)
│   ├── init-project/          # Crea la capa de proyecto (AGENTS.md, MEMORY.md, specs/...)
│   └── status/                # Estado y próximo paso
├── roles/                     # coordinator, planner, implementer, reviewer (formato neutral)
├── adapters/                  # Traducción a cada agente: claude, opencode, codex, copilot, antigravity
├── scripts/                   # install.mjs (instalar / desinstalar, con simulación)
└── agent-workflow.config.json # Agentes destino y modelo por nivel
```

## Estado

- [x] Paso 2 · Constitución y estándares de código
- [x] Paso 3 · Skills del flujo (trivial / feature / SDD)
- [x] Paso 4 · Roles y permisos
- [x] Paso 5 · Instalador para cada agente
- [x] Paso 6 · `/init-project` y plantillas
- [ ] Paso 7 · Migración de proyectos
- [ ] Paso 8 · Prueba real de punta a punta

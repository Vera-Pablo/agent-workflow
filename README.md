# agent-workflow

## Qué es el repo

agent-workflow es un harness donde las IAs que elige el desarrollador asumen roles
(`coordinator`, `planner`, `implementer`, `reviewer`, `reviewer-complex`) para llevar un
módulo desde la idea hasta el producto testeado. Define principios, estándares, fases y
permisos; el estado vive en archivos, así que se puede cambiar de agente sin perder el hilo.
El agente nunca decide solo qué construir ni da algo por terminado sin el desarrollador.

## Qué hace

- **Niveles de cambio:** `trivial` (cambio directo), `feature` (hasta 3 tareas) y `SDD`
  (spec → clarify → plan → tasks → implement → validate).
- **Modelo por complejidad:** simple (1 módulo) → Haiku; media (2-3 módulos) → Sonnet;
  compleja (>3 módulos o seguridad/lógica estricta) → Opus.
- **Tareas administrativas** (terminal, git, `.md`): OpenCode (deepseek) → Copilot → Gemini;
  si se agotó la cuota, Haiku.
- **Activación por proyecto (opt-in):** cada repo decide si usa el workflow.
- **Skills de la comunidad:** se suman a las skills propias del workflow.
- **Modo autónomo** (`sdd-autonomo`): módulos simples sin el desarrollador, en una rama
  creada por él y sin commitear.

## Cómo funciona

El workflow **no se activa solo**. En la máquina solo queda el comando `/init-workflow`. Al
ejecutarlo dentro de un proyecto se instalan ahí, excluidos de git vía `.git/info/exclude`,
los archivos de cada agente:

- **Claude Code:** `CLAUDE.local.md`, skills en `.claude/skills`, roles en `.claude/agents` y
  permisos en `.claude/settings.local.json` (pide confirmación antes de commit/push).
- **Skills comunes** (Codex, OpenCode, Copilot, Antigravity, Kimi, MiniMax): `.agents/skills`;
  Bob en `.bob/skills` y Qwen en `.qwen/skills`.
- **OpenCode:** reglas en `.opencode/agent-workflow.md`, instrucciones en
  `.opencode/opencode.json` y roles en `.opencode/agents`. Si `.opencode/opencode.json` ya
  existe, no se modifica: se omiten `opencode.json` y `agent-workflow.md` (los roles se
  instalan igual).
- **Antigravity:** `.agents/rules/agent-workflow.md`. **Qwen:** `.qwen/QWEN.local.md`.
  **Bob:** `.bob/rules/agent-workflow.md`.
- **GitHub Copilot:** solo si no existen, `.github/copilot-instructions.md` y roles en
  `.github/agents/<rol>.agent.md`. **Kimi:** solo si no existe, `.kimi-code/AGENTS.md`.
- **Codex y MiniMax:** solo skills; sus reglas se leen de `AGENTS.md` versionado.

`--only <lista>` limita la instalación a los agentes indicados: `claude`, `opencode`,
`copilot`, `antigravity`, `qwen`, `bob`, `kimi`, `codex`, `minimax`. Después, `/init-project`
crea `AGENTS.md`, `MEMORY.md`, `specs/` y la constitución del proyecto.

Ejemplo del flujo SDD: *"Quiero poder registrar ventas a crédito."*

```
1. NIVEL         El coordinator lo clasifica como SDD: toca reglas de negocio y datos.

2. SPEC          El planner entrevista y redacta specs/004-ventas-credito/spec.md con
                 requisitos verificables:
                   R-01 Si la venta es a crédito sin cliente, el sistema debe rechazarla.

3. CLARIFY       Se auditan ambigüedades y huecos.          🛑 Vos aprobás la spec.

4. PLAN          Qué código reutilizar y cómo diseñarlo.    🛑 Vos aprobás el plan.

5. TAREAS        Tareas de 20-30 min, cada una con su complejidad:
                   T-01 Validar venta a crédito ............ compleja → Opus
                   T-02 Calcular saldo del cliente ......... compleja → Opus
                   T-03 Consultar saldo en repositorio ..... simple   → Haiku
                   T-04 Selector de cliente en la pantalla . media    → Sonnet
                                                             🛑 Vos aprobás las tareas.

6. IMPLEMENTAR   Una por vez: test que falla → código mínimo → refactor → checks →
                 revisión del diff (APROBADO / CAMBIOS REQUERIDOS) → resumen y commit.
                                                             🛑 Vos das OK → commit.

7. VALIDAR       Cada requisito contra su test y su verificación funcional.
                                                             🛑 Vos validás la spec.
```

Regla central: **commits solo con veredicto APROBADO del reviewer y OK explícito del
desarrollador**. Si cambia un requisito, primero se actualiza la spec; `sdd-status` retoma
el trabajo leyendo los archivos.

## Estructura y partes del directorio

```
agent-workflow/
├── core/
│   ├── bootstrap.md            # reglas siempre activas que se instalan en cada agente
│   └── constitution.md         # principios innegociables para todos los proyectos
├── roles/                      # coordinator, planner, implementer, reviewer, reviewer-complex
├── skills/
│   ├── code-standards/         # estándares obligatorios antes de escribir o revisar código
│   ├── feature/                # flujo liviano para cambios de hasta 3 tareas
│   ├── init-project/           # crea AGENTS.md, MEMORY.md, specs/ y la constitución
│   ├── init-workflow/          # activa el workflow en el proyecto actual
│   ├── sdd/                    # orquestador de niveles, fases y puntos de control
│   ├── sdd-autonomo/           # módulo simple de punta a punta sin el desarrollador
│   ├── sdd-change/             # cambio de requisitos sobre una spec existente
│   ├── sdd-clarify/            # auditoría de la spec hasta aprobarla
│   ├── sdd-constitution/       # crea o revisa la constitución del proyecto
│   ├── sdd-implement/          # implementa una tarea con TDD y la somete a revisión
│   ├── sdd-plan/               # diseña el plan técnico de una spec aprobada
│   ├── sdd-spec/               # redacta la especificación con requisitos verificables
│   ├── sdd-status/             # informa el estado y el próximo paso exacto
│   ├── sdd-tasks/              # divide el plan en tareas pequeñas y ordenadas
│   └── sdd-validate/           # valida la implementación contra la spec
├── community-skills/
│   ├── claude/                 # skills de la comunidad para Claude Code
│   ├── codex/                  # skills de la comunidad para Codex (van a .agents/skills)
│   └── shared/                 # skills de la comunidad para cualquier agente
├── adapters/                   # traducción a los 9 agentes del modo por proyecto
├── scripts/
│   ├── install.mjs             # CLI: instalar, desinstalar, modo global y por proyecto
│   ├── project.mjs             # planificación y exclusiones del modo por proyecto
│   ├── actions.mjs             # ejecuta enlaces, archivos, bloques y JSON
│   └── lib.mjs                 # carga roles, skills y configuración
├── tests/                      # tests de la instalación global mínima y por proyecto
└── agent-workflow.config.json  # agentes destino y modelo por nivel
```

## Cómo usarlo

### 1. Instalar en la máquina

Requiere Node.js. Desde la carpeta del repo:

```powershell
node scripts/install.mjs --init-only          # simulación: muestra qué haría
node scripts/install.mjs --init-only --apply  # instala solo el comando /init-workflow
```

Para quitar una instalación global anterior:

```powershell
node scripts/install.mjs --uninstall --apply
```

### 2. Activar en cada proyecto que decidas

```powershell
/init-workflow

# equivalente desde el proyecto:
node <repo>/scripts/install.mjs --project           # simulación
node <repo>/scripts/install.mjs --project --apply   # aplica
node <repo>/scripts/install.mjs --project --only claude,qwen --apply  # solo esos agentes
```

Revertir la activación:

```powershell
node <repo>/scripts/install.mjs --project --uninstall --apply
```

### 3. Agregar skills de la comunidad

1. Copiá la carpeta de la skill (con su `SKILL.md`) en `community-skills/claude`,
   `community-skills/codex` o `community-skills/shared`.
2. Anotá su fuente y licencia.
3. Leela antes de agregarla: es texto que la IA obedece.

Se activan al correr `/init-workflow` o al reinstalar con `--project --apply`. Las de
`claude/` y `shared/` van a `.claude/skills`, `.agents/skills`, `.bob/skills` y `.qwen/skills`;
las de `codex/`, solo a `.agents/skills`. Si el nombre choca con una skill del workflow, gana
la del workflow.
Usá `--only claude,codex` (o la lista de agentes que quieras) para no reinstalar todo.

### 4. Usar el modo autónomo

Creá la rama para el trabajo, pedí `/sdd-autonomo <módulo>` y, al volver, revisá
`specs/<NNN>-<módulo>/informe-autonomo.md`. El agente no commitea: las decisiones y los
commits quedan en tus manos.

### 5. Actualizar

```powershell
git pull
```

Las skills quedan enlazadas al repo, así que se actualizan con el `git pull`. Los subagentes (`.claude/agents`) y las reglas (`CLAUDE.local.md`) son copias generadas: si cambiaron `roles/` o `core/`, volvé a correr `node <repo>/scripts/install.mjs --project --apply` en cada proyecto (es idempotente).

## Alcance actual

| Agente | Reglas | Skills | Roles |
|---|---|---|---|
| Claude Code | `CLAUDE.local.md` | `.claude/skills` | `.claude/agents` |
| OpenCode | `.opencode/agent-workflow.md` + `opencode.json` | `.agents/skills` | `.opencode/agents` |
| Copilot | `.github/copilot-instructions.md` (solo si falta) | `.agents/skills` | `.github/agents/<rol>.agent.md` (solo si falta) |
| Antigravity | `.agents/rules/agent-workflow.md` | `.agents/skills` | — |
| Qwen | `.qwen/QWEN.local.md` | `.qwen/skills` | — |
| Bob | `.bob/rules/agent-workflow.md` | `.bob/skills` | — |
| Kimi | `.kimi-code/AGENTS.md` (solo si falta) | `.agents/skills` | — |
| Codex | — (lee `AGENTS.md` versionado) | `.agents/skills` | — |
| MiniMax | — (lee `AGENTS.md` versionado) | `.agents/skills` | — |

OpenCode, Copilot y MiniMax leen `.claude/skills` y `.agents/skills`, y Copilot también
`.claude/agents`: pueden ver skills o roles duplicados.

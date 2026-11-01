---
name: init-project
description: Prepara un proyecto para trabajar con agent-workflow creando su capa de proyecto (AGENTS.md, CLAUDE.md, MEMORY.md, specs/ y constitución) a partir del código real. Usar con "/init-project", al empezar un proyecto nuevo o al migrar uno existente al workflow.
---

# Inicializar un proyecto

Crea la **capa de proyecto**. La base (constitución general, estándares, skills, roles) ya
está instalada de forma global: acá solo va lo propio de este proyecto.

## Resultado
```
proyecto/
├── AGENTS.md              ← fuente única para todos los agentes (assets/AGENTS.md)
├── CLAUDE.md              ← una línea: @AGENTS.md (Claude Code no lee AGENTS.md solo)
├── MEMORY.md              ← estado, decisiones, aprendizajes (assets/MEMORY.md)
├── docs/constitution.md   ← principios propios (skill sdd-constitution)
├── specs/README.md        ← convenciones de specs (assets/specs-README.md)
└── .agents/skills/        ← solo si hay skills de dominio (no crear vacía)
```

## Pasos

### 1. Diagnosticar (solo lectura)
Seguí `references/detection.md` para detectar:
- Stack, versiones y gestor de paquetes.
- Comandos **reales**: instalar, desarrollo, tests (todos y uno solo), lint, typecheck,
  build, codegen. Nunca inventar un comando: si no se encuentra, marcarlo `⚠ confirmar`.
- Arquitectura: carpetas principales y su responsabilidad.
- Convenciones existentes: idioma del código, de los commits y de la documentación.
- Documentación previa: `README`, `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`,
  `.github/copilot-instructions.md`, `.cursor/rules`, `docs/`.
- **Residuos:** scripts sueltos en la raíz, archivos duplicados, SQL fuera de migraciones,
  tests dispersos, documentación repartida. No se tocan: se reportan.

### 2. Proponer
Mostrar al desarrollador:
1. Resumen del diagnóstico (stack, comandos, arquitectura, convenciones).
2. Lista de archivos que se van a **crear** y los que se van a **modificar**.
3. Si ya existe `CLAUDE.md`/`AGENTS.md` con contenido: cómo se redistribuye
   (ver "Migrar instrucciones existentes"). **Nada se pierde.**
4. Residuos detectados, como futuras tareas de limpieza (no se arreglan ahora).
5. Preguntas sobre lo que no se pudo determinar.

**Esperar el OK del desarrollador** antes de escribir cualquier archivo.

### 3. Crear
- `AGENTS.md` con `assets/AGENTS.md`. Máximo ~60 líneas: es un mapa, no un manual.
  Lo extenso va a `docs/` y se referencia.
- `CLAUDE.md` con una sola línea: `@AGENTS.md`.
- `MEMORY.md` con `assets/MEMORY.md`, cargando el estado actual y los residuos como pendientes.
- `specs/README.md` con `assets/specs-README.md`. Si ya hay specs en otro formato, no moverlas:
  anotarlas en `MEMORY.md` como pendiente de migración.
- `docs/constitution.md`: ejecutar la skill `sdd-constitution`.

### 4. Cerrar
- Verificar que los comandos de `AGENTS.md` funcionan (correr al menos tests y lint/analyze).
- Mostrar el resumen de cambios y el mensaje de commit propuesto:
  `docs: inicializa capa de proyecto de agent-workflow`.
- Commit **solo con el OK del desarrollador**.
- Próximo paso sugerido: limpieza de residuos (como `feature`) o primera spec (`sdd-spec`).

## Migrar instrucciones existentes
Si hay un `CLAUDE.md`, `GEMINI.md` u otro archivo de instrucciones con contenido, repartirlo así:

| Contenido | Destino |
|---|---|
| Stack, comandos, arquitectura, convenciones | `AGENTS.md` |
| Invariantes de dominio y reglas innegociables | `docs/constitution.md` |
| Estado actual, decisiones, trampas conocidas | `MEMORY.md` |
| Detalle extenso (guías, explicaciones largas) | `docs/<tema>.md`, referenciado desde `AGENTS.md` |
| Lo que contradice o duplica la base global | se descarta, avisando al desarrollador |

Recién con todo redistribuido y aprobado, `CLAUDE.md` pasa a ser `@AGENTS.md`.

## Proyecto nuevo (sin código)
Entrevistar al desarrollador (stack previsto, plataformas, arquitectura deseada, idioma) y
crear los mismos archivos con lo decidido. Los comandos que aún no existen se marcan
`⚠ pendiente`.

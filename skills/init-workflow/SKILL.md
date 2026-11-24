---
name: init-workflow
description: Activa agent-workflow en el proyecto actual (instalación por proyecto). Usar con "/init-workflow" cuando el desarrollador decide que este proyecto use el workflow.
---

# Activar el workflow en este proyecto

El workflow **no está activo en ningún proyecto** hasta que el desarrollador corre este
comando. La activación es solo para el proyecto actual (`cwd`), queda todo local y excluido
de git, y no toca el home.

## Resultado

Se instalan, dentro del proyecto y excluidos de git (`.git/info/exclude`), los archivos de
cada agente:

- **Claude Code:** `CLAUDE.local.md`, skills en `.claude/skills`, roles en `.claude/agents` y
  `.claude/settings.local.json` (pide confirmación antes de commit/push).
- **Skills comunes:** `.agents/skills` para Codex, OpenCode, Copilot, Antigravity, Kimi y
  MiniMax; Bob en `.bob/skills` y Qwen en `.qwen/skills`.
- **OpenCode:** `.opencode/agent-workflow.md`, `.opencode/opencode.json` (instrucciones) y
  roles en `.opencode/agents`. Si `.opencode/opencode.json` ya existe, no se modifica: se
  omiten `opencode.json` y `agent-workflow.md` (los roles se instalan igual).
- **Antigravity:** `.agents/rules/agent-workflow.md`. **Qwen:** `.qwen/QWEN.local.md`.
  **Bob:** `.bob/rules/agent-workflow.md`.
- **Copilot:** solo si no existen, `.github/copilot-instructions.md` y roles en
  `.github/agents/<rol>.agent.md`. **Kimi:** solo si no existe, `.kimi-code/AGENTS.md`.
- **Codex y MiniMax:** solo skills; sus reglas se leen de `AGENTS.md` versionado.

`--only <lista>` limita la instalación a `claude`, `opencode`, `copilot`, `antigravity`,
`qwen`, `bob`, `kimi`, `codex` o `minimax`.

## Pasos

### 1. Validar el proyecto (solo lectura)
- Debe existir `.git` como **carpeta** en el `cwd`. Si no es un repo git, avisar y parar.
- No debe ser el propio repo del workflow: si existen `scripts/install.mjs` y
  `roles/coordinator.md` en la raíz, avisar y parar.

### 2. Ubicar el repo del workflow
Tomar la ruta real (`realpath`) de esta skill y subir dos niveles
(`skills/init-workflow` → raíz del repo). Esa ruta absoluta es `<WF>`.

### 3. Simular
Desde el proyecto: `node <WF>/scripts/install.mjs --project` (sin `--apply`). Con
`--only <lista>` simula solo los agentes indicados.
Mostrar al desarrollador **qué se crea** y **qué se omite** por ser ajeno.
**Esperar su OK explícito.**

### 4. Aplicar
`node <WF>/scripts/install.mjs --project --apply`.
Informar archivos creados y omitidos. Recordar que queda excluido de git
(`.git/info/exclude`).

### 5. Crear la capa de proyecto
Ejecutar a continuación la skill `init-project` (AGENTS.md, MEMORY.md, `specs/`,
constitución), que tiene su propio punto de control.

## Reversión
`node <WF>/scripts/install.mjs --project --uninstall --apply` deja el proyecto como antes.

## Alcance actual
Los 9 agentes del modo por proyecto: Claude Code, OpenCode, Copilot, Antigravity, Qwen, Bob,
Kimi, Codex y MiniMax. Sin git commit.

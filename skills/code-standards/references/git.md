# Commits

## Regla
Un commit por tarea, con Conventional Commits. El idioma de la descripción lo define el
`AGENTS.md` del proyecto.

```
<tipo>(<alcance opcional>): <descripción en imperativo, minúscula, sin punto>

<cuerpo opcional: por qué se hizo, no qué>

Refs: <ID de tarea o requisito, ej. T-003, RF-12>
```

## Tipos
`feat` funcionalidad · `fix` corrección · `refactor` sin cambio de comportamiento ·
`test` solo tests · `docs` documentación · `chore` mantenimiento · `perf` rendimiento ·
`build` / `ci` build e integración continua.

## Reglas
- Solo se commitea con tests, linter y typecheck en verde y la tarea aprobada por el reviewer y el OK explícito del desarrollador.
- El commit contiene solo los archivos de la tarea. Nada de cambios ajenos mezclados.
- Agregar los archivos **por nombre** (`git add ruta/a ruta/b`). Prohibido `git add .`, `git add -A`
  y `git commit -a`: arrastran archivos locales o ajenos a la tarea.
- Nunca commitear secretos, `.env`, builds ni archivos temporales.
- Cambios incompatibles: `feat!:` o `BREAKING CHANGE:` en el cuerpo.
- Trabajar en ramas; `main` se actualiza por merge/PR según el proyecto.

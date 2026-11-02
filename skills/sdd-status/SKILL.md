---
name: sdd-status
description: Informa el estado del trabajo en el proyecto: specs activas, fase de cada una, progreso de tareas, bloqueos y el próximo paso exacto. Usar al retomar una sesión, al cambiar de agente o cuando el desarrollador pregunte dónde estamos.
---

# Estado del proyecto

Solo lectura: no modifica nada.

## Pasos
1. Leer `MEMORY.md`.
2. Recorrer `specs/*/` y leer la línea `Estado:` de cada `spec.md`, `plan.md`, `tasks.md` y
   `feature.md`; contar tareas por estado.
3. Ver `git status` y los últimos commits para detectar trabajo sin commitear o desfasajes
   (ej. tarea `[x]` sin commit, cambios sin tarea asociada).
4. Responder con este formato:

```
ESTADO · <proyecto>
Activa: NNN-slug · fase: <fase> · tareas: 3/7 (1 en revisión, 1 bloqueada)
Otras: NNN-slug (validada) · NNN-slug (borrador)
Bloqueos / preguntas abiertas: ...
Cambios sin commitear: ...
Próximo paso: <skill> <argumento> — <qué se va a hacer>
```

Si `MEMORY.md` y los archivos de specs no coinciden, señalarlo y proponer cuál corregir.

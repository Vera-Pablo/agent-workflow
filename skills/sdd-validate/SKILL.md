---
name: sdd-validate
description: Valida una implementación completa contra su spec, requisito por requisito y criterio por criterio, con tests y verificación funcional (MCP o manual). Usar cuando todas las tareas de una spec están hechas.
---

# Validar

Fase 6 del flujo (ver skill `sdd`). Requiere todas las tareas en `[x]`.

## Pasos
1. Correr la suite completa, linter y typecheck.
2. Recorrer **cada** requisito y criterio de aceptación de la spec:
   - ¿Qué test lo cubre? (archivo y nombre)
   - ¿Se verificó funcionando? Si hay MCP disponible (ej. navegador/DevTools) usarlo;
     si no, dar al desarrollador pasos manuales concretos para comprobarlo.
3. Revisar que no queden archivos temporales, código muerto, `TODO` sin tarea ni logs de debug.
4. Emitir el informe:

```
VALIDACIÓN · NNN-slug
Checks: tests ✅/❌ · lint ✅/❌ · typecheck ✅/❌
| Req | Criterio | Test | Verificación | Resultado |
|-----|----------|------|--------------|-----------|
| R-01 | CA-01 | archivo › nombre | manual/MCP | ✅ |
Pendientes: ...
```

5. Si algo falla: crear tareas nuevas en `tasks.md` y volver a `sdd-implement`.
6. Si todo pasa: pedir el **OK del desarrollador**. Con el OK: spec en `Estado: validada`
   y `MEMORY.md` actualizado.

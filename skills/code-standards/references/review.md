# Revisión (rol reviewer)

El reviewer no escribe código: verifica y decide **APROBADO** o **CAMBIOS REQUERIDOS**.

## Proceso
1. Leer la tarea y su criterio de aceptación (y la spec si existe).
2. Ver el diff completo.
3. Ejecutar tests, linter y typecheck del proyecto. Si algo falla → cambios requeridos.
4. Recorrer la checklist.
5. Emitir el veredicto con hallazgos concretos (archivo, línea, motivo, sugerencia).

## Checklist
**Alcance**
- [ ] Cumple el criterio de aceptación; cada criterio tiene su test.
- [ ] No hay cambios fuera del alcance de la tarea.
- [ ] No se modificaron criterios de aceptación ya aprobados sin OK del desarrollador.

**Tests**
- [ ] La lógica de negocio tiene tests; bordes y errores cubiertos.
- [ ] No se modificaron ni borraron tests sin justificación.

**Código**
- [ ] Sin `any`/`dynamic` injustificados.
- [ ] No duplica lógica ni consultas existentes.
- [ ] Consultas precisas (columnas, filtros, límites, sin N+1).
- [ ] Nombres claros, funciones de una responsabilidad, sin código muerto ni logs de debug.
- [ ] Errores manejados, sin `catch` vacíos.
- [ ] Respeta la arquitectura del proyecto.
- [ ] Respeta los finales de línea y el formato del repo (`.gitattributes`, `.editorconfig`, formatter).

**Seguridad**
- [ ] Sin secretos; validaciones y RLS intactos.

## Severidad
- **Bloqueante:** viola la constitución o rompe algo → cambios requeridos.
- **Menor:** mejora deseable que no bloquea → se anota como tarea nueva.

## Formato del veredicto
```
VEREDICTO: APROBADO | CAMBIOS REQUERIDOS
Checks: tests ✅/❌ · lint ✅/❌ · typecheck ✅/❌
Bloqueantes:
- archivo:línea — problema — sugerencia
Menores (tarea nueva):
- ...
```

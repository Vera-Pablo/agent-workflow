---
name: sdd-plan
description: Diseña el plan técnico (plan.md) de una spec aprobada: enfoque, reutilización de código existente, cambios por capa, funciones puras, datos y estrategia de tests. Usar después de aprobar una spec.
---

# Planificar

Fase 3 del flujo (ver skill `sdd`). Se define **cómo**. Requiere spec con `Estado: aprobada`;
si no lo está, volver a `sdd-clarify`.

## Pasos
1. Leer la spec, `AGENTS.md`, `MEMORY.md`, `docs/constitution.md` y la skill `code-standards`.
2. **Investigar el código existente** antes de diseñar: buscar funciones, servicios,
   repositorios, componentes, tipos y consultas que ya resuelvan parte del problema.
3. Completar `plan.md` con la plantilla `../sdd/assets/plan.md`:
   - La sección **Reutilización** es obligatoria y concreta (rutas y nombres reales).
   - Lógica de negocio como funciones puras con firma y pseudocódigo breve.
   - Cada consulta nueva: columnas, filtros, límites. Cambios de esquema por migración.
   - Cada requisito de la spec aparece en la tabla de tests.
4. Respetar la arquitectura del proyecto. Si el plan necesita romperla, plantearlo como
   decisión explícita al desarrollador.
5. Registrar decisiones con alternativa descartada y motivo.
6. Mostrar el plan y **esperar el OK del desarrollador**. Con el OK: `Estado: aprobado`.

## Al terminar
Próximo paso: `sdd-tasks`.

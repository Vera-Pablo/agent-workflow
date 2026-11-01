---
name: sdd-constitution
description: Crea o revisa la constitución del proyecto (docs/constitution.md), los principios propios del proyecto que se suman a la constitución general del workflow. Usar al iniciar un proyecto nuevo o cuando el desarrollador quiera cambiar sus principios.
---

# Constitución del proyecto

La constitución general del workflow ya aplica a todos los proyectos. Este archivo solo
**agrega** lo propio del proyecto. Nunca puede relajar un principio general.

## Pasos
1. Leer `AGENTS.md`, `README`, la documentación existente y la estructura del código.
2. Proponer principios propios en estas categorías (solo las que apliquen):
   - **Arquitectura:** capas, dependencias permitidas, dónde va cada cosa.
   - **Dominio:** invariantes de negocio que nunca se rompen (ej. "el stock solo cambia por movimientos").
   - **Datos:** reglas de esquema, aislamiento, migraciones, sincronización.
   - **Calidad:** cobertura mínima, tipos de test obligatorios, rendimiento.
   - **Plataformas y restricciones:** sistemas objetivo, límites técnicos conocidos.
3. Cada principio: una oración, verificable, con el motivo en una línea.
4. Máximo ~40 líneas. Mostrar la propuesta y **esperar el OK del desarrollador** antes de escribir.
5. Si ya existe: señalar principios vagos, contradictorios, obsoletos o que relajen la
   constitución general, y proponer cambios.

## Formato
```markdown
# Constitución · <proyecto>
Actualizado: AAAA-MM-DD
Complementa la constitución general del workflow. No la reemplaza.

## Arquitectura
1. <principio> — <motivo>
## Dominio
...
```

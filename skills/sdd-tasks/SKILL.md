---
name: sdd-tasks
description: Divide un plan aprobado en tareas pequeñas (20-30 min), ordenadas por dependencia y verificables, en tasks.md. Usar después de aprobar plan.md.
---

# Desglosar en tareas

Fase 4 del flujo (ver skill `sdd`). Requiere plan con `Estado: aprobado`.

## Reglas de una buena tarea
- Se hace en 20-30 minutos y deja el proyecto compilando y con tests en verde.
- Un único objetivo, cubre requisitos concretos (`R-xx`, `CA-xx`).
- Indica el test que se escribe primero y un "hecho cuando" verificable.
- Lista los archivos que toca. Si toca más de ~5, dividirla.
- Termina en un único commit (mensaje propuesto incluido).
- Orden: dominio y tests → datos → integración → UI. Primero lo que no depende de nada.

## Complejidad y quién implementa
Cada tarea declara su complejidad. Ante la duda, la más alta.

| Complejidad | Cuándo | Implementa |
|---|---|---|
| **simple** | Patrón ya existente en el código, 1-2 archivos, sin reglas de negocio nuevas (ej. un campo más, un test de borde, una consulta calcada de otra) | Modelo gratuito/económico |
| **media** | Lógica de negocio acotada y clara, 2-4 archivos | Modelo estándar (gratuito bueno o Claude) |
| **compleja** | Cualquiera de: reglas de negocio centrales, datos/migraciones/RLS, sincronización o concurrencia, seguridad, más de 4 archivos, diseño no trivial | **Claude** |

## Pasos
1. Crear `tasks.md` con la plantilla `../sdd/assets/tasks.md`.
2. Verificar cobertura: cada requisito y criterio de la spec está en al menos una tarea.
3. Máximo ~12 tareas; si hacen falta más, la spec es demasiado grande.
4. Mostrar las tareas y **esperar el OK del desarrollador**. Con el OK: `Estado: aprobado`
   y spec en `Estado: implementando`.

## Al terminar
Próximo paso: `sdd-implement` con la primera tarea pendiente.

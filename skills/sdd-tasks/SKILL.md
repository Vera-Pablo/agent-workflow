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
Cada tarea declara su complejidad y su tipo (`código | administrativa`).

| Complejidad | Cuándo | Implementa |
|---|---|---|
| **simple** | Un solo módulo, sin tocar otros; funciones sencillas sin impacto en seguridad ni escalabilidad | Haiku |
| **media** | 2 a 3 módulos; funciones medianas con lógica de negocio acotada | Sonnet |
| **compleja** | Más de 3 módulos, o cualquier cantidad con lógica estricta o seguridad (reglas de negocio centrales, datos/migraciones/RLS, concurrencia, auth) | Opus |

- Si una tarea cae en dos niveles, se toma el más alto.
- **Administrativas** (terminal, git, escribir `.md`/specs): no las hace Claude; van a la
  primera IA gratuita con cuota diaria: OpenCode (deepseek) → Copilot → Gemini; si las tres
  agotaron cuota, Haiku.
- Dos rechazos del reviewer en una tarea `simple` o `media`: escalar un nivel de modelo.

## Pasos
1. Crear `tasks.md` con la plantilla `../sdd/assets/tasks.md`.
2. Verificar cobertura: cada requisito y criterio de la spec está en al menos una tarea.
3. Máximo ~12 tareas; si hacen falta más, la spec es demasiado grande.
4. Mostrar las tareas y **esperar el OK del desarrollador**. Con el OK: `Estado: aprobado`
   y spec en `Estado: implementando`.

## Al terminar
Próximo paso: `sdd-implement` con la primera tarea pendiente.

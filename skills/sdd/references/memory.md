# MEMORY.md

Memoria persistente entre sesiones y entre agentes. Máximo ~50 líneas: es un resumen, no un diario.

## Estructura
```markdown
# MEMORY
Actualizado: AAAA-MM-DD

## Estado actual
- Spec activa: 003-importacion-csv · fase: implementar · próxima: T-04

## Decisiones
- AAAA-MM-DD · <decisión> · <por qué> · (spec/tarea)

## Aprendizajes y trampas
- <algo que costó descubrir y no hay que repetir>

## Pendientes / preguntas abiertas
- <pregunta> · <a quién>
```

## Reglas
- Leerlo al iniciar cualquier sesión. Actualizarlo al cerrar una tarea, tomar una decisión o
  descubrir una trampa.
- Si supera ~50 líneas: mover decisiones viejas a `docs/decisions.md` y dejar solo lo vigente.
- Nada de secretos, logs ni detalles que ya estén en el código o en las specs.

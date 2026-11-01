# Constitución del workflow

Principios innegociables para **todo proyecto y todo agente**. La constitución de cada
proyecto (`docs/constitution.md`) puede agregar principios, nunca relajar estos.
Ante un conflicto entre velocidad y estos principios, ganan los principios.

## Principios

1. **Ningún cambio sin intención.** Todo cambio nace de una tarea con objetivo y criterio de
   aceptación claros. Si no se sabe qué se espera, no se escribe código.
2. **TDD en la lógica de negocio.** Rojo → verde → refactor. El test se escribe primero y
   falla por la razón correcta antes de implementar.
3. **Tipado estricto.** Prohibido `any` (TS) y `dynamic` (Dart) salvo justificación explícita
   en un comentario en la misma línea.
4. **Reutilizar antes de crear.** Antes de escribir una función, tipo, componente o consulta,
   buscar si ya existe. Duplicar lógica es un defecto.
5. **Consultas precisas.** Columnas explícitas, filtros y límites en la base de datos. Nunca
   traer todo para filtrar en memoria, nunca consultas vagas ni N+1.
6. **Clean code.** Nombres que revelan intención, una responsabilidad por función, sin código
   muerto, sin números mágicos, sin comentarios que expliquen el *qué* (solo el *por qué*).
7. **Un commit por tarea**, con Conventional Commits, y solo con la aprobación del reviewer
   y el OK explícito del desarrollador. El agente nunca commitea por su cuenta.
8. **Revisión obligatoria.** Nada está terminado sin checks en verde y aprobación del reviewer.
9. **No inventar.** Ante ambigüedad, contradicción o decisión abierta: preguntar. Nunca
   asumir requisitos, APIs ni datos.
10. **Alcance acotado.** No tocar nada fuera de la tarea. Las mejoras que se detecten se
    anotan como tarea nueva, no se hacen "de paso".
11. **Seguridad primero.** Nunca leer ni commitear secretos (`.env`, claves). Nunca desactivar
    validaciones, RLS o tests para "hacer que funcione".
12. **Repo limpio.** Nada de scripts sueltos en la raíz: lo temporal va a `scripts/` y se
    borra o se convierte en test real antes de cerrar la tarea.

## Niveles de cambio

| Nivel | Cuándo | Flujo |
|---|---|---|
| **Trivial** | Typo, estilo, renombre local, sin lógica nueva | Cambio directo + checks + OK del desarrollador + commit |
| **Feature** | Cambio acotado (≤ 3 tareas), sin decisiones de arquitectura | `/feature`: plan corto → tareas → TDD → revisión |
| **SDD** | Funcionalidad nueva, varias capas, reglas de negocio o datos | spec → clarify → plan → tasks → implement → validate |

Si hay duda entre dos niveles, se elige el más alto.

## Definición de terminado (DoD)

Una tarea está terminada solo si:
- [ ] Cumple su criterio de aceptación.
- [ ] Tiene tests (obligatorios si toca lógica de negocio) y **todos** los tests pasan.
- [ ] El análisis estático / linter / typecheck no da errores.
- [ ] Respeta la skill `code-standards`.
- [ ] El reviewer la aprobó y el desarrollador dio su OK.
- [ ] Quedó en un único commit convencional.
- [ ] `MEMORY.md` actualizado si hubo una decisión o aprendizaje relevante.

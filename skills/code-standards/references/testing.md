# Tests y TDD

## Obligatorio
TDD es obligatorio en la **lógica de negocio**: reglas, cálculos, validaciones, transiciones
de estado, transformaciones de datos. Para UI y glue code, los tests son recomendados.

## Ciclo
1. **Rojo:** escribir un test que exprese el comportamiento esperado. Ejecutarlo y ver que
   falla *por la razón correcta* (no por un import roto o un typo).
2. **Verde:** escribir el código mínimo para que pase.
3. **Refactor:** limpiar código y test con los tests en verde.
4. Repetir por cada comportamiento. Un test → un comportamiento.

## Buenos tests
- Nombre que describe el comportamiento: `rejects credit sale without customer`.
- Estructura Arrange / Act / Assert, claramente separada.
- Independientes entre sí y deterministas (sin depender de la hora real, el orden o la red).
- Prueban comportamiento observable, no detalles internos.
- Incluyen bordes: vacío, cero, negativo, límite, error, duplicado.
- Los criterios de aceptación de la tarea o spec se traducen 1:1 a tests.

## Prohibido
- Modificar o borrar un test para que pase sin que la tarea lo justifique.
- `skip` / `only` commiteados.
- Tests que no verifican nada (sin assertions) o que verifican mocks en lugar de resultados.
- Scripts sueltos tipo `test_algo.ts` en la raíz: si verifican algo valioso, se convierten en
  tests de la suite; si no, se borran.

## Organización
- La ubicación y el comando de tests los define el `AGENTS.md` del proyecto.
- Separar unitarios (rápidos, sin I/O) de integración (base de datos, red).

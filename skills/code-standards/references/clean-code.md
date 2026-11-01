# Clean code

## Nombres
- Revelan intención: `pendingInvoices`, no `data`, `list2` ni `tmp`.
- Funciones con verbo (`calculateBalance`), booleanos con `is/has/can/should`.
- Sin abreviaturas ambiguas. Un mismo concepto se llama igual en todo el código.
- Idioma de los nombres: el que define el `AGENTS.md` del proyecto. No mezclar.

## Funciones
- Una sola responsabilidad. Si para describirla usás "y", probablemente son dos.
- Preferir funciones puras para la lógica de negocio: entrada → salida, sin efectos.
- Efectos (red, base de datos, archivos) en los bordes, no mezclados con reglas de negocio.
- Pocos parámetros; más de 3 relacionados → un objeto con tipo propio.
- Retornos tempranos (guard clauses) en lugar de `if` anidados.

## Estructura
- Respetar la arquitectura del proyecto (capas y carpetas definidas en su `AGENTS.md`).
- La UI no contiene reglas de negocio ni consultas: delega en dominio/servicios.
- Sin duplicación: si una lógica aparece dos veces, se extrae y se reutiliza.
- Sin números ni strings mágicos: constantes con nombre.

## Errores
- Nunca tragar errores (`catch {}` vacío, `catch (_) {}`).
- Errores de dominio con tipo propio y mensaje útil; no lanzar strings.
- Validar en los bordes (entrada de usuario, API, archivos); dentro, confiar en los tipos.

## Comentarios
- Explican el *por qué* (una decisión, una restricción externa), nunca el *qué*.
- Código comentado = código muerto: se borra (está en git).
- TODO solo con referencia a una tarea: `// TODO(T-012): ...`.

## Señales de alerta
Funciones de más de ~40 líneas, archivos de más de ~400, más de 3 niveles de anidación,
nombres genéricos (`helper`, `utils2`, `manager`), parámetros booleanos que cambian el
comportamiento. No son prohibiciones automáticas: son motivos para revisar el diseño.

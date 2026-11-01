# Requisitos en notación EARS

Cada requisito es una oración verificable con una de estas formas:

| Tipo | Forma | Ejemplo |
|---|---|---|
| Ubicuo | El sistema debe `<respuesta>`. | El sistema debe guardar los precios con 2 decimales. |
| Por evento | Cuando `<disparador>`, el sistema debe `<respuesta>`. | Cuando el usuario confirma una venta, el sistema debe descontar el stock. |
| Por estado | Mientras `<estado>`, el sistema debe `<respuesta>`. | Mientras no haya conexión, el sistema debe encolar los cambios. |
| No deseado | Si `<condición>`, entonces el sistema debe `<respuesta>`. | Si la venta es a crédito sin cliente, entonces el sistema debe rechazarla. |
| Opcional | Donde `<característica>`, el sistema debe `<respuesta>`. | Donde haya impresora configurada, el sistema debe ofrecer imprimir. |

## Reglas
- Un requisito = un comportamiento. Si tiene "y", probablemente son dos.
- Sin palabras vagas: "rápido", "fácil", "adecuado", "etc.", "algunos" → reemplazar por valores.
- Cada requisito tiene al menos un criterio de aceptación verificable (Dado / Cuando / Entonces).

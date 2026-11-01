---
name: code-standards
description: Estándares de código obligatorios (clean code, TDD, tipado estricto, reutilización, consultas precisas, commits y revisión). Usar SIEMPRE antes de escribir, modificar o revisar código en cualquier proyecto.
---

# Estándares de código

Estos estándares bajan a la práctica la constitución del workflow. Son obligatorios.
Leé la referencia del tema que vayas a tocar antes de empezar.

| Tema | Referencia | Leer cuando... |
|---|---|---|
| Legibilidad y diseño | `references/clean-code.md` | Escribís o modificás cualquier código |
| Tests y TDD | `references/testing.md` | Tocás lógica de negocio o escribís tests |
| Tipado | `references/typing.md` | Escribís TypeScript o Dart |
| Datos y consultas | `references/data-access.md` | Tocás base de datos, APIs o estado |
| Commits | `references/git.md` | Vas a commitear |
| Revisión | `references/review.md` | Revisás un cambio (rol reviewer) |

## Checklist rápido (antes de dar algo por hecho)

1. ¿Busqué si ya existía una función, tipo, componente o consulta que resolviera esto?
2. ¿Escribí el test primero y lo vi fallar? (lógica de negocio)
3. ¿Cero `any` / `dynamic` sin justificación en la misma línea?
4. ¿Cada consulta pide solo las columnas y filas que necesita?
5. ¿Los nombres se entienden sin leer la implementación?
6. ¿Cada función hace una sola cosa?
7. ¿Quedó código muerto, `console.log`/`print`, TODO sin tarea o archivos temporales? → eliminarlos.
8. ¿Toqué algo fuera del alcance de la tarea? → revertirlo y anotarlo como tarea nueva.
9. ¿Tests, linter y typecheck en verde?

Si algún punto no se cumple, la tarea **no está terminada**.

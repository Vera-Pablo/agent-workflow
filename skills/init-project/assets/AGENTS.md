# <Nombre del proyecto>

<Qué es y para quién, en 2-3 líneas.>
La fuente de verdad del alcance es <docs/requerimientos.md | specs/ | ...>.

Este proyecto usa **agent-workflow** (constitución general, skills y roles instalados de forma
global). Principios propios en `docs/constitution.md`. Estado y decisiones en `MEMORY.md`.

## Stack
- <Lenguaje / framework / versión>
- <Base de datos / backend / servicios>

## Comandos
| Para | Comando |
|---|---|
| Instalar dependencias | `...` |
| Desarrollo | `...` |
| Tests (todos) | `...` |
| Un test | `...` |
| Lint / análisis | `...` |
| Typecheck | `...` |
| Build | `...` |
| Codegen | `...` |

**Checks** (los que corren implementer y reviewer antes de aprobar): `<tests> && <lint> && <typecheck>`

## Arquitectura
- `<carpeta>/` — <responsabilidad>
- `<carpeta>/` — <responsabilidad>

Reglas de dependencia: <ej. la UI no accede a datos directamente; dominio sin dependencias de framework>.

## Convenciones
- Idioma: código <es|en> · commits <es|en> · documentación <es|en>.
- <Patrones obligatorios del proyecto: estado, inyección, manejo de errores...>

## Límites
- No modificar: <archivos generados, vendor, migraciones ya aplicadas...>
- <Dependencias fijadas y por qué.>

## Referencias
- `docs/<archivo>.md` — <de qué trata>

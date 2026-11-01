# Datos y consultas

## Reutilizar
- Cada entidad tiene **un** punto de acceso (repositorio / servicio). Antes de escribir una
  consulta nueva, buscar si ese repositorio ya tiene un método que sirva o se pueda extender.
- No duplicar consultas equivalentes en distintos archivos.
- La UI nunca consulta la base de datos directamente: pasa por el repositorio/servicio.
- Reutilizar datos ya cargados (estado, caché, streams) en lugar de volver a pedirlos.

## Consultas precisas
- Columnas explícitas: nada de `select *` / `.select()` vacío. Pedir solo lo que se usa.
- Filtrar, ordenar, paginar y agregar **en la base de datos**, no en memoria.
- Siempre límite o paginación en listados (`.range()`, `LIMIT`).
- Sin N+1: si se necesitan datos relacionados, una consulta con join/embed, no un bucle de consultas.
- Nombres de métodos que dicen qué devuelven: `findActiveProductsByCategory`, no `getData`.
- Tipar el resultado de cada consulta.

## Escrituras
- Operaciones que deben ser atómicas → transacción o función en la base (RPC).
- Validar antes de escribir; manejar y tipar los errores de la base.
- Cambios de esquema solo por migraciones versionadas, nunca SQL suelto.

## Supabase (si el proyecto lo usa)
- RLS activado en toda tabla con datos de usuario/negocio. Nunca desactivarlo para probar.
- La service key jamás en el cliente.
- Migraciones en `supabase/migrations/`; las políticas también son código y se testean.

## Revisión rápida de una consulta
¿Pide solo las columnas necesarias? ¿Filtra en la base? ¿Tiene límite? ¿Ya existía otra
igual? ¿Está en el repositorio correcto? ¿El resultado está tipado?

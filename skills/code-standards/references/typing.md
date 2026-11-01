# Tipado estricto

## Regla
Prohibido `any` (TypeScript) y `dynamic` (Dart) salvo justificación explícita en la misma línea:

```ts
const raw = JSON.parse(body) as any; // any: payload externo, se valida con zod en la línea siguiente
```

Sin justificación, el reviewer lo rechaza.

## TypeScript
- `strict: true` en `tsconfig`. No usar `@ts-ignore`; si es inevitable, `@ts-expect-error` con motivo.
- Para datos externos desconocidos: `unknown` + validación (zod, type guards), no `any`.
- Tipos de dominio en un único lugar por dominio; no duplicar interfaces equivalentes.
- Preferir uniones discriminadas a flags booleanos y strings sueltos.
- Evitar `as` para "convencer" al compilador; si hace falta, revisar el diseño.
- Sin `!` (non-null assertion) salvo que la invariante esté garantizada y comentada.

## Dart
- `analysis_options.yaml` con reglas estrictas (`strict-casts`, `strict-raw-types`, `strict-inference`).
- Sin `dynamic` implícito: tipar colecciones, funciones y JSON (`Map<String, Object?>`).
- Para JSON: modelos con `fromJson`/`toJson` tipados; no pasar `Map` crudos por la app.
- Evitar `!`; preferir manejo explícito del null.
- Modelos inmutables (`final`, `copyWith`).

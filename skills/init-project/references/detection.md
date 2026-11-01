# Detección de stack y comandos

Buscar en este orden. Leer el archivo para extraer versiones y comandos reales.

| Archivo | Stack | Dónde están los comandos |
|---|---|---|
| `package.json` | Node / TS / JS | `scripts`; gestor según lockfile (`package-lock.json` npm, `pnpm-lock.yaml` pnpm, `yarn.lock` yarn, `bun.lockb` bun) |
| `pubspec.yaml` | Flutter / Dart | `flutter pub get`, `flutter analyze`, `flutter test`, `dart run build_runner build` si hay `build_runner` |
| `pyproject.toml`, `requirements.txt` | Python | `[tool.*]`, `Makefile`; pytest, ruff, mypy |
| `go.mod` | Go | `go test ./...`, `go vet ./...`, `golangci-lint` |
| `Cargo.toml` | Rust | `cargo test`, `cargo clippy`, `cargo fmt --check` |
| `*.csproj`, `*.sln` | .NET / C# | `dotnet build`, `dotnet test`, `dotnet format --verify-no-changes` |
| `pom.xml`, `build.gradle*` | Java / Kotlin | `mvn test` / `./gradlew test` |
| `composer.json` | PHP | `scripts`; phpunit, phpstan |
| `Makefile`, `justfile`, `Taskfile.yml` | cualquiera | sus targets suelen ser los comandos oficiales |
| `supabase/`, `prisma/`, `migrations/` | base de datos | comando de migraciones |
| `.github/workflows/*.yml` | CI | los pasos de CI son la verdad sobre cómo se verifica |

## Monorepos
Si hay varias superficies (ej. web + API + móvil), documentar comandos por superficie en
`AGENTS.md`, cada una con su carpeta.

## Configuración de calidad a revisar
- TS: `tsconfig.json` (`strict`), ESLint/Biome, Prettier.
- Dart: `analysis_options.yaml` (strict-casts, strict-inference, strict-raw-types).
- Si falta configuración estricta exigida por la constitución general, anotarlo como tarea.

## Residuos típicos (reportar, no tocar)
- Scripts sueltos en la raíz: `test_*.ts`, `fix-*.js`, `tmp*`, `backup*`, `*.old`.
- SQL fuera de las migraciones versionadas.
- Tests en varias carpetas sin criterio (unitarios mezclados con scripts manuales).
- Tipos duplicados por dominio (ej. `types.ts` y `types/index.ts`).
- Documentación repartida en varias carpetas o archivos enormes (> ~40 KB).
- Marcadores de conflicto de git (`<<<<<<<`) en cualquier archivo.
- `.env` u otros secretos versionados (avisar de inmediato sin mostrar su contenido).

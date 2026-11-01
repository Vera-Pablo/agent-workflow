# Scripts

## Instalar

Desde la carpeta del repo, en PowerShell:

```powershell
node scripts/install.mjs            # 1. simulación: muestra qué va a hacer
node scripts/install.mjs --apply    # 2. instala
```

Opciones:
- `--only claude,opencode` instala solo para esos agentes.
- `--uninstall` (con `--apply`) revierte todo lo instalado.
- `--home <ruta>` usa otra carpeta como home (útil para probar).

## Actualizar

Las skills y los roles quedan **enlazados** a este repo, así que un `git pull` alcanza.
Volvé a correr `--apply` solo si cambiaste `core/`, `roles/`, la configuración o agregaste
una skill nueva.

## Configuración

`agent-workflow.config.json` define los agentes destino y el modelo para cada nivel
(`strong` / `standard` / `cheap`). Para ajustes propios sin commitearlos, copialo como
`agent-workflow.local.json` (está en `.gitignore`).

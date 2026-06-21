# Generar el .ipa (gratis, sin Mac) e instalar con Sideloadly

La app se compila en una **Mac virtual gratis de GitHub Actions** y descargas el
`.ipa`. Luego **Sideloadly** lo firma con tu Apple ID gratis y lo instala en el iPhone.

> El `.ipa` queda **sin firmar**: eso es justo lo que Sideloadly necesita.

## Paso 1 — Subir el proyecto a GitHub (una sola vez)
En la carpeta del proyecto, en la terminal:

```bash
gh auth login        # inicia sesión en GitHub (elige GitHub.com → HTTPS → browser)
gh repo create cnty2-pos --private --source . --remote origin --push
```

(Si no usas `gh`, crea el repo en github.com y haz `git push`.)

## Paso 2 — Agregar las credenciales de Supabase como "Secrets"
En GitHub: **tu repo → Settings → Secrets and variables → Actions → New repository secret**.
Crea estos dos (copia los valores **desde tu archivo `.env` local**, no los pongas en el código):

- `EXPO_PUBLIC_SUPABASE_URL` → (el valor de `EXPO_PUBLIC_SUPABASE_URL` en tu `.env`)
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` → (el valor de `EXPO_PUBLIC_SUPABASE_ANON_KEY` en tu `.env`)

## Paso 3 — Ejecutar el build
En GitHub: **pestaña Actions → "Build iOS (unsigned IPA para Sideloadly)" → Run workflow**.
Tarda ~10-15 min. Al terminar, abre la ejecución y descarga el artefacto
**`cnty2-ios-unsigned`** (es un .zip que contiene `cnty2-unsigned.ipa`).

## Paso 4 — Instalar con Sideloadly
1. Instala **Sideloadly** (sideloadly.io) en tu PC y conecta el iPhone por cable.
2. Arrastra el `cnty2-unsigned.ipa` a Sideloadly.
3. Pon tu **Apple ID** (gratis) y dale **Start**. Acepta en el iPhone:
   **Ajustes → General → VPN y gestión de dispositivos → confía en tu Apple ID**.
4. ¡Listo! El ícono **cnty2** aparece en tu pantalla.

> ⚠️ Con Apple ID gratis la app dura **7 días**; cuando expire, vuelve a abrir
> Sideloadly y dale Start otra vez (o usa su función de "auto-refresh" dejando el
> PC conectado). Si más adelante quieres que dure 1 año sin renovar, se necesita
> la cuenta de Apple Developer ($99/año).

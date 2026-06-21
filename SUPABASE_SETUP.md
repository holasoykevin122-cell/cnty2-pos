# Conectar la app a Supabase (Fase 2)

Esto guarda el inventario y las ventas en la nube, con respaldo y acceso desde
varios dispositivos. Sigue estos pasos **una sola vez**.

## 1. Crear el proyecto
1. Entra a https://supabase.com y crea una cuenta (gratis).
2. **New project** → ponle nombre (ej. `cnty2-jeans`), elige una contraseña para
   la base de datos y la región más cercana (ej. *South America (São Paulo)*).
3. Espera ~2 minutos a que se cree.

## 2. Crear las tablas
1. En el menú izquierdo abre **SQL Editor**.
2. Abre el archivo [`supabase/schema.sql`](./supabase/schema.sql) de este proyecto,
   copia **todo** su contenido y pégalo en el editor.
3. Presiona **Run**. Debe decir *Success*.

## 3. Copiar las credenciales
1. Ve a **Project Settings** (engranaje) → **API Keys** (o **Data API**).
2. Copia dos cosas:
   - **Project URL** (algo como `https://xxxxxxxx.supabase.co`)
   - **anon / publishable key** (una cadena larga)

## 4. Pegarlas en la app
1. En la carpeta del proyecto, copia el archivo `.env.example` y renómbralo a **`.env`**.
2. Pega tus valores:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
   ```
3. Reinicia la app (`npm start`).

## 5. Crear el usuario de la tienda
La app pedirá iniciar sesión. Puedes crear el usuario desde la app (pantalla de
registro) o desde **Authentication → Users → Add user** en Supabase.

---

> El archivo `.env` **no se sube a git** (está en `.gitignore`) para no exponer las
> credenciales. La *anon key* es segura en el celular: la base de datos está
> protegida por políticas RLS que hacen que cada usuaria solo vea sus propios datos.

# Ryuka Manager · Etapa 5A — Nube, usuarios y Android

## 1. Crear las tablas

En Supabase abrí **SQL Editor**, pegá el contenido de `supabase/ryuka-cloud.sql` y presioná **Run**.

## 2. Configurar autenticación

En **Authentication > Providers > Email**, dejá Email habilitado.
Para probar más rápido podés desactivar temporalmente **Confirm email**. En producción es recomendable activarlo.

## 3. Ejecutar localmente

```powershell
npm install
npm run build
npm run dev
```

## 4. Primer ingreso y migración

1. Abrí `http://localhost:3000`.
2. Creá la cuenta principal.
3. Al ingresar por primera vez, Ryuka sube automáticamente los datos existentes de `localStorage` a Supabase.
4. En **Taller y nube** vas a encontrar el código para compartir el taller.

## 5. Segunda persona

1. Crea su propia cuenta.
2. Entra a **Taller y nube**.
3. Escribe el código del taller principal.
4. Ryuka recarga los datos compartidos.

## 6. Publicar en Vercel

Cargá estas variables en **Vercel > Project Settings > Environment Variables**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Después hacé Deploy.

## 7. Instalar en Android

Abrí la URL publicada en Chrome, tocá el menú de tres puntos y elegí **Agregar a pantalla principal** o **Instalar aplicación**.

## Alcance de esta etapa

La sincronización usa un estado JSON compartido por taller y estrategia de “última escritura gana”. Funciona bien para un equipo pequeño, pero conviene evitar editar exactamente el mismo registro al mismo tiempo desde dos dispositivos. En la siguiente migración se pueden separar los módulos en tablas relacionales individuales.

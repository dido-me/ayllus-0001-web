# Modo Mantenimiento - Ayllus Peru

## Descripción
Se ha implementado un sistema de mantenimiento que redirige todas las páginas del sitio web a una página de mantenimiento personalizada.

## Archivos creados/modificados:

### 1. Layout de Mantenimiento
- **Archivo:** `src/layouts/Layout.maintenance.astro`
- **Descripción:** Layout específico para la página de mantenimiento con diseño atractivo y fuente Onest.

### 2. Página de Mantenimiento
- **Archivo:** `src/pages/mantenimiento.astro`
- **Descripción:** Página principal de mantenimiento con:
  - Logo principal de Ayllus Peru (`/logo/logo_black.webp`)
  - Isotipo secundario (`/logo/isotipo_black.webp`)
  - Enlaces directos a redes sociales:
    - Facebook: https://www.facebook.com/coorayllusperu
    - Instagram: https://www.instagram.com/cooperativa.ayllus.peru/
    - WhatsApp: https://api.whatsapp.com/send/?phone=51066284623
  - Diseño simple y responsive
  - Iconos SVG integrados para cada red social
  - Efectos hover y animaciones suaves

### 3. Middleware de Redirección
- **Archivo:** `src/middleware.ts`
- **Descripción:** Intercepta todas las solicitudes y redirige a `/mantenimiento` basado en la variable de entorno `MAINTENANCE_MODE`.

### 4. Variable de Entorno
- **Archivo:** `.env`
- **Variable:** `MAINTENANCE_MODE=true/false`
- **Descripción:** Controla el estado del modo mantenimiento desde el archivo de configuración.

## Cómo usar:

### Para ACTIVAR el modo mantenimiento:
**En desarrollo local:**
Editar `.env` y establecer:
```bash
MAINTENANCE_MODE=true
```

**En producción (Vercel):**
1. Ve al dashboard de Vercel → Settings → Environment Variables
2. Agrega: `MAINTENANCE_MODE` = `true`
3. Redeploy la aplicación

### Para DESACTIVAR el modo mantenimiento:
**En desarrollo local:**
Editar `.env` y establecer:
```bash
MAINTENANCE_MODE=false
```

**En producción (Vercel):**
1. Ve al dashboard de Vercel → Settings → Environment Variables
2. Cambia: `MAINTENANCE_MODE` = `false`
3. Redeploy la aplicación

**Nota:** El servidor se reinicia automáticamente al cambiar el archivo `.env` en desarrollo.

### Para personalizar la página de mantenimiento:
Editar `src/pages/mantenimiento.astro` para modificar:
- Mensaje principal
- Información de contacto
- Diseño y colores
- Logo (actualmente usa `/logo/logo.png`)

## Características técnicas:

- ✅ Utiliza la fuente `@fontsource-variable/onest` ya instalada
- ✅ Diseño responsive y moderno
- ✅ Logos oficiales de Ayllus Peru integrados:
  - Logo principal: `/logo/logo_black.webp`
  - Isotipo: `/logo/isotipo_black.webp`
- ✅ Enlaces directos a redes sociales oficiales:
  - Facebook con colores corporativos (#1877f2)
  - Instagram con gradiente oficial
  - WhatsApp con color verde oficial (#25d366)
- ✅ Iconos SVG optimizados para cada red social
- ✅ Efectos hover y animaciones suaves
- ✅ Control desde variable de entorno `MAINTENANCE_MODE`
- ✅ Redirecciones automáticas para todas las páginas
- ✅ Mantiene acceso a recursos estáticos
- ✅ Compatible con el adaptador Vercel configurado
- ✅ Meta tags apropiados para SEO (noindex durante mantenimiento)
- ✅ Diseño centrado y limpio sin elementos innecesarios

## Rutas que permanecen accesibles:
- `/mantenimiento` - Página principal de mantenimiento
- `/favicon.svg` - Favicon del sitio
- `/logo/*` - Todos los archivos de logo
- `/_astro/*` - Recursos compilados de Astro
- `/public/*` - Archivos públicos estáticos

## Testing:
Para probar que funciona correctamente:
1. Ejecutar `npm run dev`
2. Visitar `http://localhost:4321/` - debe redirigir a `/mantenimiento`
3. Visitar cualquier otra ruta - debe redirigir a `/mantenimiento`
4. Visitar `http://localhost:4321/mantenimiento` directamente - debe mostrar la página

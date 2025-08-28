# Configuración de Variables de Entorno en Vercel

## Para configurar el modo mantenimiento en Vercel:

### Opción 1: Dashboard de Vercel (RECOMENDADO)
1. Ve a tu proyecto en [vercel.com](https://vercel.com)
2. Navega a **Settings** → **Environment Variables**
3. Agrega una nueva variable:
   - **Name:** `MAINTENANCE_MODE`
   - **Value:** `true` (para activar) o `false` (para desactivar)
   - **Environments:** Selecciona `Production`, `Preview`, y `Development`
4. Haz clic en **Save**
5. Redeploy tu aplicación

### Opción 2: CLI de Vercel
```bash
# Activar mantenimiento
vercel env add MAINTENANCE_MODE production
# Cuando se solicite el valor, escribir: true

# Desactivar mantenimiento
vercel env add MAINTENANCE_MODE production
# Cuando se solicite el valor, escribir: false

# Luego redeploy
vercel --prod
```

### Opción 3: Archivo vercel.json (NO RECOMENDADO para producción)
El archivo `vercel.json` incluido en el proyecto es solo de referencia.
Para configuraciones de producción, usar el dashboard o CLI.

## Verificación

### Para verificar que funciona:
1. **Mantenimiento Activo** (`MAINTENANCE_MODE=true`):
   - Todas las rutas redirigen a `/mantenimiento`
   - La página `/mantenimiento` se muestra correctamente

2. **Mantenimiento Desactivado** (`MAINTENANCE_MODE=false`):
   - Las rutas funcionan normalmente
   - No hay redirecciones

### Variables de entorno necesarias en Vercel:
```
MAINTENANCE_MODE=true
STRAPI_URL=tu_strapi_url
TOKEN_STRAPI=tu_token
EMAIL_ADMIN_REVIEW=tu_email
EMAIL_PASS=tu_password
EMAIL_USER=tu_email_user
GOOGLE_SECRET_KEY=tu_google_key
PUBLIC_GOOGLE_SITE_KEY=tu_public_key
BASE_URL=tu_base_url
PHONE_NUMBER=tu_telefono
```

## Notas importantes:
- Las variables públicas (que empiezan con `PUBLIC_`) estarán disponibles en el cliente
- Las variables privadas solo están disponibles en el servidor
- `MAINTENANCE_MODE` es una variable privada por seguridad
- Después de cambiar variables de entorno, siempre redeploy la aplicación

## Troubleshooting:
- Si el mantenimiento no se activa: Verifica que la variable esté configurada como string `"true"`
- Si hay errores de compilación: Revisa que todas las variables requeridas estén configuradas
- Si las redirecciones no funcionan: Verifica que el middleware esté correcto en el deployment

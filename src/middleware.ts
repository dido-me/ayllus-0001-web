import { defineMiddleware } from 'astro:middleware'

export const onRequest = defineMiddleware(async (context, next) => {
  // Verificar el modo mantenimiento en tiempo de ejecución para Vercel
  const maintenanceMode = true

  // Si el modo mantenimiento está desactivado, continuar normalmente
  if (!maintenanceMode) {
    return next()
  }

  const url = context.url

  // Lista de rutas que NO deben ser redirigidas durante mantenimiento
  const allowedPaths = [
    '/mantenimiento',
    '/favicon.svg',
    '/logo/',
    '/_astro/',
    '/public/'
  ]

  // Si es la página de mantenimiento o recursos estáticos, permitir acceso
  if (allowedPaths.some(path => url.pathname.startsWith(path))) {
    return next()
  }

  // Para todas las demás páginas, redirigir a mantenimiento
  return Response.redirect(new URL('/mantenimiento', url.origin), 302)
})

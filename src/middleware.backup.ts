import { defineMiddleware } from 'astro:middleware'

// MODO MANTENIMIENTO: Cambiar a false para desactivar
const MAINTENANCE_MODE = true

export const onRequest = defineMiddleware(async (context, next) => {
  // Si el modo mantenimiento está desactivado, continuar normalmente
  if (!MAINTENANCE_MODE) {
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

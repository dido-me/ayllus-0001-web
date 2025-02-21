// src/pages/api/sendMessage.ts
import type { FileUploadType } from '@src/types/share/fileUpload'
import type { MessageData } from '@src/types/share/messageData'
import type { APIContext } from 'astro'
import nodemailer from 'nodemailer'

const RECAPTCHA_SECRET_KEY = import.meta.env.GOOGLE_SECRET_KEY || ''
const API_STRAPI_URL = import.meta.env.STRAPI_URL || ''
const EMAIL_USER = import.meta.env.EMAIL_USER || ''
const EMAIL_PASS = import.meta.env.EMAIL_PASS || ''
const EMAIL_ADMIN_REVIEW = import.meta.env.EMAIL_ADMIN_REVIEW || ''
const BASE_URL = import.meta.env.BASE_URL || 'http://localhost:4321'

const transporter = nodemailer.createTransport({
  host: 'mail.efsystemas.net',
  port: 465,
  secure: true,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
})

async function verifyRecaptcha (token: string): Promise<boolean> {
  const response = await fetch(
    'https://www.google.com/recaptcha/api/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: RECAPTCHA_SECRET_KEY,
        response: token
      })
    }
  )

  const data = await response.json()
  return data.success
}

async function sendConfirmationEmails (data: MessageData) {
  // Validar campos requeridos
  if (!data.email || !data.nombre_cliente) {
    throw new Error('Email o nombre del cliente faltante')
  }

  // Correo al usuario
  const userMailOptions = {
    from: EMAIL_USER,
    to: data.email,
    subject: 'Confirmación de Mensaje Recibido - Servicio al cliente - Coopac Ayllu Perú',
    html: `
      <div style="text-align: center;">
        <img src="${BASE_URL}/logo/isotipo_black.webp" alt="Isotipo Coopac Ayllu Perú" style="max-width: 100px; height: auto;" />
        <img src="${BASE_URL}/logo/logo_black.webp" alt="Logo Coopac Ayllu Perú" style="max-width: 200px; height: auto;" />
      </div>
      <h2>Estimado/a ${data.nombre_cliente}</h2>
      <p>Hemos recibido correctamente su mensaje con el asunto: "${data.asunto || 'Sin asunto'}"</p>
      <p>Nos pondremos en contacto con usted a la brevedad posible.</p>
      <p>Gracias por contactarnos,</p>
      <p>Equipo Coopac Ayllu Perú</p>
    `
  }

  // Correo a consultas
  const adminMailOptions = {
    from: EMAIL_USER,
    to: EMAIL_ADMIN_REVIEW,
    subject: 'Nuevo Mensaje Recibido de Servicio al cliente - Coopac Ayllu Perú',
    html: `
      <div style="text-align: center;">
        <img src="${BASE_URL}/logo/isotipo_black.webp" alt="Isotipo Coopac Ayllu Perú" style="max-width: 100px; height: auto;" />
        <img src="${BASE_URL}/logo/logo_black.webp" alt="Logo Coopac Ayllu Perú" style="max-width: 200px; height: auto;" />
      </div>
      <h2>Nuevo mensaje recibido</h2>
      <p>Se ha recibido un nuevo mensaje de ${data.nombre_cliente} (${data.email}).</p>
      <p><strong>Asunto:</strong> ${data.asunto || 'Sin asunto'}</p>
      <p><strong>DNI:</strong> ${data.dni || 'No proporcionado'}</p>
      <p><strong>Localidad:</strong> ${data.localidad || 'No proporcionada'}</p>
      <p><strong>Dirección:</strong> ${data.direccion || 'No proporcionada'}</p>
      <p><strong>Celular:</strong> ${data.celular || 'No proporcionado'}</p>
      <p><strong>Mensaje:</strong> ${data.mensaje_cliente || 'Sin mensaje'}</p>
      <p><strong>Archivos adjuntos:</strong> ${data.archivos_adjunto.length > 0 ? data.archivos_adjunto.length : 'Ninguno'}</p>
      <p>Por favor, revisar en el sistema Strapi para más detalles, ingrese <a href="https://ayllus-0001-strapi-production.up.railway.app/admin" target="_blank">aquí</a>.</p>
    `
  }

  try {
    await Promise.all([
      transporter.sendMail(userMailOptions),
      transporter.sendMail(adminMailOptions)
    ])
  } catch (error) {
    console.error('Error al enviar correos:', error)
    throw error
  }
}

export async function POST ({ request }: APIContext) {
  try {
    const formData = await request.formData()

    const recaptchaToken = formData.get('recaptcha_token') as string

    if (!recaptchaToken) {
      return new Response(
        JSON.stringify({ error: 'Token de reCAPTCHA faltante' }),
        { status: 400 }
      )
    }

    const isRecaptchaValid = await verifyRecaptcha(recaptchaToken)

    if (!isRecaptchaValid) {
      return new Response(
        JSON.stringify({ error: 'Fallo en la verificación de reCAPTCHA' }),
        { status: 403 }
      )
    }

    const files = formData.getAll('archivos_adjunto') as File[]
    let fileIds: number[] = []

    if (files.length > 0) {
      const uploadData = new FormData()

      files.forEach((file) => {
        uploadData.append('files', file)
      })

      const uploadResponse = await fetch(`${API_STRAPI_URL}/api/upload`, {
        method: 'POST',
        body: uploadData
      })

      if (!uploadResponse.ok) {
        throw new Error('Error al subir los archivos')
      }

      const uploadResult: FileUploadType[] = await uploadResponse.json()
      fileIds = uploadResult.map((file) => file.id) || []
    }

    // Construir datos para el mensaje
    const mensajeData = {
      data: {
        nombre_cliente: formData.get('nombre_cliente') as string | null,
        dni: formData.get('dni') as string | null,
        localidad: formData.get('localidad') as string | null,
        direccion: formData.get('direccion') as string | null,
        asunto: formData.get('asunto') as string | null,
        email: formData.get('email') as string | null,
        mensaje_cliente: formData.get('mensaje_cliente') as string | null,
        estado: 'Recibido',
        celular: formData.get('celular') as string | null,
        archivos_adjunto: fileIds
      }
    }
    // Enviar datos del mensaje a Strapi
    const messageResponse = await fetch(
      `${API_STRAPI_URL}/api/mensajes-contactos`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mensajeData)
      }
    )

    if (!messageResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Error al enviar el mensaje' }),
        { status: 500 }
      )
    }

    const messageResult = await messageResponse.json()

    await sendConfirmationEmails(mensajeData.data)

    return new Response(JSON.stringify(messageResult), { status: 200 })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Error en el servidor', details: error }),
      { status: 500 }
    )
  }
}

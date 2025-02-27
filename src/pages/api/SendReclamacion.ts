// src/pages/api/sendMessage.ts
import type { LibroDeReclamo } from '@src/types/libro-reclamaciones/libroReclamaciones'
import type { FileUploadType } from '@src/types/share/fileUpload'
import type { APIContext } from 'astro'
import nodemailer from 'nodemailer'

const RECAPTCHA_SECRET_KEY = import.meta.env.GOOGLE_SECRET_KEY || ''
const API_STRAPI_URL = import.meta.env.STRAPI_URL || ''
const EMAIL_USER = import.meta.env.EMAIL_USER || ''
const EMAIL_PASS = import.meta.env.EMAIL_PASS || ''
const EMAIL_ADMIN_REVIEW = import.meta.env.EMAIL_ADMIN_REVIEW || ''
const TOKEN_STRAPI = import.meta.env.TOKEN_STRAPI || ''

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

async function sendConfirmationEmails (data: LibroDeReclamo) {
  // Validate required fields
  if (!data.correo_electronico || !data.nombres) {
    throw new Error('Email o nombre del cliente faltante')
  }

  // Common disclaimer text for both emails
  const disclaimer = `
      <p><strong>*RECLAMO:</strong> Disconformidad relacionada a los productos o servicios.</p>
      <p><strong>**QUEJA:</strong> Disconformidad no relacionada a los productos o servicios; o, malestar o descontento respecto a la atención al público.</p>
      <p><strong>***</strong> La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI.</p>
      <p><strong>****</strong> El proveedor debe dar respuesta al reclamo o queja en un plazo no mayor a quince (15) días hábiles, el cual es improrrogable.</p>
    `

  // Email to the user
  const userMailOptions = {
    from: EMAIL_USER,
    to: data.correo_electronico,
    subject:
      'Confirmación de Mensaje Recibido - Servicio al cliente - Coopac Ayllu Perú',
    html: `
        <h2>Estimado/a ${data.nombres} ${data.apellido_paterno}</h2>
        <p>Hemos recibido correctamente su ${data.tipo_libro_reclamacion.toLowerCase()} con el motivo: "${
      data.motivo
    } - ${data.descripcion_motivo}"</p>
        <p>Nos pondremos en contacto con usted a la brevedad posible mediante ${
          data.medio_respuesta
        }.</p>
        <p>Gracias por contactarnos,</p>
        <p>Equipo Coopac Ayllu Perú</p>
        ${disclaimer}
      `
  }

  // Email to admin/review team
  const adminMailOptions = {
    from: EMAIL_USER,
    to: EMAIL_ADMIN_REVIEW,
    subject:
      'Nuevo Mensaje Recibido de Servicio al cliente - Coopac Ayllu Perú',
    html: `
        <h2>Nuevo ${data.tipo_libro_reclamacion.toLowerCase()} recibido</h2>
        <p>Se ha recibido un nuevo ${data.tipo_libro_reclamacion.toLowerCase()} de ${
      data.nombres
    } ${data.apellido_paterno} ${data.apellido_materno} (${
      data.correo_electronico
    }).</p>
        <p><strong>Tipo:</strong> ${data.tipo_libro_reclamacion}</p>
        <p><strong>Documento:</strong> ${data.documento_identidad} - ${
      data.numero_documento
    }</p>
        <p><strong>Motivo:</strong> ${data.motivo} - ${
      data.descripcion_motivo
    }</p>
        <p><strong>Monto del reclamo:</strong> ${
          data.monto_reclamo_motivo || 'No especificado'
        }</p>
        <p><strong>Departamento:</strong> ${data.departamento}</p>
        <p><strong>Domicilio:</strong> ${data.domicilio}</p>
        <p><strong>Celular:</strong> ${data.celular || 'No proporcionado'}</p>
        <p><strong>Teléfono:</strong> ${data.telefono || 'No proporcionado'}</p>
        <p><strong>Detalles:</strong> ${data.detalle || 'Sin detalles'}</p>
        <p><strong>Menor de edad:</strong> ${
          data.menor_de_edad ? 'Sí' : 'No'
        }</p>
        ${
          data.menor_de_edad
            ? `
        <p><strong>Datos del tutor:</strong></p>
        <p>Documento tutor: ${
          data.documento_identidad_tutor || 'No proporcionado'
        } - ${data.numero_documento_tutor || 'No proporcionado'}</p>
        <p>Nombre tutor: ${data.nombres_tutor || ''} ${
                data.apellido_paterno_tutor || ''
              } ${data.apellido_materno_tutor || ''}</p>
        <p>Correo tutor: ${
          data.correo_electronico_tutor || 'No proporcionado'
        }</p>
        <p>Celular tutor: ${data.celular_tutor || 'No proporcionado'}</p>
        `
            : ''
        }
        <p><strong>Archivos adjuntos:</strong> ${
          data.archivos_adjunto && data.archivos_adjunto.length > 0
            ? data.archivos_adjunto.length
            : 'Ninguno'
        }</p>
        <p>Por favor, revisar en el sistema Strapi para más detalles, ingrese <a href="https://ayllus-0001-strapi-production.up.railway.app/admin" target="_blank">aquí</a>.</p>
        ${disclaimer}
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
        headers: {
          Authorization: `Bearer ${TOKEN_STRAPI}`
        },
        body: uploadData
      })

      if (!uploadResponse.ok) {
        throw new Error('Error al subir los archivos')
      }

      const uploadResult: FileUploadType[] = await uploadResponse.json()
      fileIds = uploadResult.map((file) => file.id) || []
    }

    const mensajeDataBody: LibroDeReclamo = {
      documento_identidad: formData.get('documento_identidad') as
        | 'DNI'
        | 'RUC'
        | 'CARNET DE EXTRANJERIA'
        | 'PASAPORTE',
      numero_documento: formData.get('numero_documento') as string,
      nombres: formData.get('nombres') as string,
      apellido_paterno: formData.get('apellido_paterno') as string,
      apellido_materno: formData.get('apellido_materno') as string,
      telefono: formData.get('telefono') as string | undefined,
      celular: formData.get('celular') as string | undefined,
      correo_electronico: formData.get('correo_electronico') as string,
      domicilio: formData.get('domicilio') as string,
      departamento: formData.get('departamento') as string,
      menor_de_edad: formData.get('menor_de_edad') === 'true', // Convert string to boolean
      documento_identidad_tutor: formData.get('documento_identidad_tutor') as
        | 'DNI'
        | 'RUC'
        | 'CARNET DE EXTRANJERIA'
        | 'PASAPORTE'
        | undefined || '',
      numero_documento_tutor: formData.get('numero_documento_tutor') as
        | string
        | undefined || '',
      nombres_tutor: formData.get('nombres_tutor') as string | undefined || '',
      apellido_paterno_tutor: formData.get('apellido_paterno_tutor') as
        | string
        | undefined || '',
      apellido_materno_tutor: formData.get('apellido_materno_tutor') as
        | string
        | undefined || '',
      telefono_tutor: formData.get('telefono_tutor') as string | undefined || '',
      celular_tutor: formData.get('celular_tutor') as string | undefined || '',
      correo_electronico_tutor: formData.get('correo_electronico_tutor') as
        | string
        | undefined || '',
      motivo: formData.get('motivo') as 'Producto' | 'Servicio',
      descripcion_motivo: formData.get('descripcion_motivo') as string,
      monto_reclamo_motivo: formData.get('monto_reclamo_motivo') as string,
      tipo_libro_reclamacion: formData.get('tipo_libro_reclamacion') as
        | 'Reclamo'
        | 'Queja',
      medio_respuesta: formData.get('medio_respuesta') as 'Carta' | 'Email',
      detalle: formData.get('detalle') as string,
      archivos_adjunto: fileIds,
      pedido: formData.get('pedido') as string | undefined,
      estado_reclamo: 'Recibido'
    }

    // Construir datos para el mensaje
    const mensajeData = {
      data: mensajeDataBody
    }
    // Enviar datos del mensaje a Strapi
    const messageResponse = await fetch(
      `${API_STRAPI_URL}/api/libro-de-reclamos`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN_STRAPI}`
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

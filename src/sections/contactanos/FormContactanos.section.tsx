import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useCallback, useState } from 'react'
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3'

const RECAPTCHA_SITE_KEY = import.meta.env.PUBLIC_GOOGLE_SITE_KEY || ''

const schema = z.object({
  nombre_cliente: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  dni: z.string()
    .regex(/^\d{8}$/, 'El DNI debe contener solo números y tener 8 dígitos'),
  localidad: z.enum(['Ayacucho', 'Pichari', 'Kimbiri']),
  direccion: z.string().min(5, 'La dirección es obligatoria'),
  asunto: z.enum(['Solicitud de Credito', 'Informacion de Ahorros', 'Apertura de Cuenta', 'Convocatorias', 'Informacion sobre la Cooperativa']),
  email: z.string().email('Ingrese un email válido'),
  mensaje_cliente: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
  celular: z.string().regex(/^9\d{8}$/, 'El celular debe tener 9 dígitos y empezar con 9'),
  archivos_adjunto: z.array(z.instanceof(File)).optional(),
  aceptar_terminos: z.boolean().refine(value => value === true, { message: 'Debe aceptar los términos y condiciones' })
})

type FormData = z.infer<typeof schema>;

function ContactForm () {
  const { executeRecaptcha } = useGoogleReCaptcha()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(schema)
  })

  const onSubmit = useCallback(async (data: FormData) => {
    if (!executeRecaptcha) {
      setErrorMessage('Error: reCAPTCHA no está disponible. Intente nuevamente más tarde.')
      return
    }

    setIsSubmitting(true)
    setSuccessMessage('')
    setErrorMessage('')

    let token: string | null = null

    try {
      token = await executeRecaptcha('submit')

      if (!token) {
        throw new Error('No se recibió un token válido de reCAPTCHA.')
      }
    } catch (error) {
      setIsSubmitting(false)
      setErrorMessage('Error en la validación de reCAPTCHA. Intente nuevamente.')
      return
    }

    try {
      const formData = new FormData()
      Object.keys(data).forEach((key) => {
        if (key === 'archivos_adjunto' && data.archivos_adjunto) {
          data.archivos_adjunto.forEach((file) => formData.append('archivos_adjunto', file))
        } else {
          formData.append(key, data[key as keyof FormData] as string)
        }
      })

      formData.append('recaptcha_token', token)

      const response = await fetch('/api/sendMessageForCliente', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Error al enviar el formulario')
      }

      await response.json()
      setSuccessMessage('Mensaje enviado exitosamente.')
      reset()
      setTimeout(() => setSuccessMessage(''), 5000)
    } catch (error) {
      setErrorMessage('Error al enviar el formulario.')
    } finally {
      setIsSubmitting(false)
    }
  }, [executeRecaptcha, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="container mx-auto px-4 md:px-8 pb-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
      {/* Nombre Cliente */}
      <div>
        <label className="block text-sm font-semibold mb-1">Nombre Cliente</label>
        <input {...register('nombre_cliente')} className="w-full p-1 border border-black rounded-md shadow-sm" />
        {errors.nombre_cliente && <p className="text-red-500 text-xs">{errors.nombre_cliente.message}</p>}
      </div>

      {/* DNI */}
      <div>
        <label className="block text-sm font-semibold mb-1">DNI</label>
        <input {...register('dni')} className="w-full p-1 border border-black rounded-md shadow-sm" maxLength={8} />
        {errors.dni && <p className="text-red-500 text-xs">{errors.dni.message}</p>}
      </div>

      {/* Localidad */}
      <div>
        <label className="block text-sm font-semibold mb-1">Localidad</label>
        <select {...register('localidad')} className="w-full p-1 border border-black rounded-md shadow-sm">
          <option value="Ayacucho">Ayacucho</option>
          <option value="Pichari">Pichari</option>
          <option value="Kimbiri">Kimbiri</option>
        </select>
        {errors.localidad && <p className="text-red-500 text-xs">{errors.localidad.message}</p>}
      </div>

      {/* Celular */}
      <div>
        <label className="block text-sm font-semibold mb-1">Celular</label>
        <input {...register('celular')} className="w-full p-1 border border-black rounded-md shadow-sm" maxLength={9} />
        {errors.celular && <p className="text-red-500 text-xs">{errors.celular.message}</p>}
      </div>

      {/* Dirección */}
      <div className="sm:col-span-2">
        <label className="block text-sm font-semibold mb-1">Dirección</label>
        <input {...register('direccion')} className="w-full p-1 border border-black rounded-md shadow-sm" />
        {errors.direccion && <p className="text-red-500 text-xs">{errors.direccion.message}</p>}
      </div>

      {/* Email */}
      <div className="sm:col-span-2">
        <label className="block text-sm font-semibold mb-1">Email</label>
        <input {...register('email')} className="w-full p-1 border border-black rounded-md shadow-sm" />
        {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
      </div>

      {/* Asunto */}
      <div className="sm:col-span-2">
        <label className="block text-sm font-semibold mb-1">Asunto</label>
        <select {...register('asunto')} className="w-full p-1 border border-black rounded-md shadow-sm">
          <option value="Solicitud de Credito">Solicitud de Crédito</option>
          <option value="Informacion de Ahorros">Información de Ahorros</option>
          <option value="Apertura de Cuenta">Apertura de Cuenta</option>
          <option value="Convocatorias">Convocatorias</option>
          <option value="Informacion sobre la Cooperativa">Información sobre la Cooperativa</option>
        </select>
        {errors.asunto && <p className="text-red-500 text-xs">{errors.asunto.message}</p>}
      </div>

      {/* Archivos Adjuntos */}
      <div className="sm:col-span-2">
        <label className="block text-sm font-semibold mb-1">Archivos Adjuntos</label>
        <input
          type="file"
          multiple
          className="w-full p-1 border border-black rounded-md shadow-sm"
          onChange={(e) => setValue('archivos_adjunto', Array.from(e.target.files || []))}
        />
        {errors.archivos_adjunto && <p className="text-red-500 text-xs">{errors.archivos_adjunto.message}</p>}
      </div>

      {/* Mensaje */}
      <div className="sm:col-span-2">
        <label className="block text-sm font-semibold mb-1">Mensaje</label>
        <textarea {...register('mensaje_cliente')} className="w-full p-1 border border-black rounded-md shadow-sm" rows={3} />
        {errors.mensaje_cliente && <p className="text-red-500 text-xs">{errors.mensaje_cliente.message}</p>}
      </div>

      {/* Aceptar Términos */}
      <div className="sm:col-span-2 flex items-center gap-2">
        <input type="checkbox" {...register('aceptar_terminos')} className="mt-1" />
        <label className="text-xs">
          Acepto las <a href="#" className="text-blue-600 underline">políticas de privacidad</a>
        </label>
        {errors.aceptar_terminos && <p className="text-red-500 text-xs">{errors.aceptar_terminos.message}</p>}
      </div>

      {/* Mensajes de éxito/error */}
      {successMessage && <p className="sm:col-span-2 text-green-500 text-xs">{successMessage}</p>}
      {errorMessage && <p className="sm:col-span-2 text-red-500 text-xs">{errorMessage}</p>}

      {/* Botón de envío */}
      <div className="sm:col-span-2 flex justify-center">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-ayllus-primary text-white px-4 py-1 text-sm rounded-md hover:bg-ayllus-secondary disabled:bg-gray-400"
        >
          {isSubmitting ? 'Enviando...' : 'Enviar'}
        </button>
      </div>
    </form>

  )
}

export default function ContactFormWrapper () {
  return <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_SITE_KEY}>
    <ContactForm />
  </GoogleReCaptchaProvider>
}

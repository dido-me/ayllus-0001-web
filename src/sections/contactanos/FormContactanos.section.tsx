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
    <form onSubmit={handleSubmit(onSubmit)} className="container mx-auto px-10 md:px-20 pb-20 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="mb-4">
        <label className="block text-lg md:text-2xl font-extrabold mb-4">Nombre Cliente</label>
        <input {...register('nombre_cliente')} className="w-full p-2 border rounded-lg shadow border-[#0E0D35]" />
        {errors.nombre_cliente && <p className="text-red-500">{errors.nombre_cliente.message}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-lg md:text-2xl font-extrabold mb-4">DNI</label>
        <input {...register('dni')} className="w-full p-2 border rounded-lg shadow border-[#0E0D35]" maxLength={8} />
        {errors.dni && <p className="text-red-500">{errors.dni.message}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-lg md:text-2xl font-extrabold mb-4">Localidad</label>
        <select {...register('localidad')} className="w-full p-2 border rounded-lg shadow border-[#0E0D35]">
          <option value="Ayacucho">Ayacucho</option>
          <option value="Pichari">Pichari</option>
          <option value="Kimbiri">Kimbiri</option>
        </select>
        {errors.localidad && <p className="text-red-500">{errors.localidad.message}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-lg md:text-2xl font-extrabold mb-4">Celular</label>
        <input {...register('celular')} className="w-full p-2 border rounded-lg shadow border-[#0E0D35]" maxLength={9} />
        {errors.celular && <p className="text-red-500">{errors.celular.message}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-lg md:text-2xl font-extrabold mb-4">Dirección</label>
        <input {...register('direccion')} className="w-full p-2 border rounded-lg shadow border-[#0E0D35]" />
        {errors.direccion && <p className="text-red-500">{errors.direccion.message}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-lg md:text-2xl font-extrabold mb-4">Email</label>
        <input {...register('email')} className="w-full p-2 border rounded-lg shadow border-[#0E0D35]" />
        {errors.email && <p className="text-red-500">{errors.email.message}</p>}
      </div>

      <div className="mb-4 md:col-span-2">
        <label className="block text-lg md:text-2xl font-extrabold mb-4">Asunto</label>
        <select {...register('asunto')} className="w-full p-2 border rounded-lg shadow border-[#0E0D35]">
          <option value="Solicitud de Credito">Solicitud de Credito</option>
          <option value="Informacion de Ahorros">Informacion de Ahorros</option>
          <option value="Apertura de Cuenta">Apertura de Cuenta</option>
          <option value="Convocatorias">Convocatorias</option>
          <option value="Informacion sobre la Cooperativa">Informacion sobre la Cooperativa</option>
        </select>
        {errors.asunto && <p className="text-red-500">{errors.asunto.message}</p>}
      </div>

      <div className="mb-4 md:col-span-2">
        <label className="block text-lg md:text-2xl font-extrabold mb-4">Archivos Adjuntos</label>
        <input
          type="file"
          multiple
          className="w-full p-2 border rounded-lg shadow border-[#0E0D35]"
          onChange={(e) => setValue('archivos_adjunto', Array.from(e.target.files || []))}
        />
        {errors.archivos_adjunto && <p className="text-red-500">{errors.archivos_adjunto.message}</p>}
      </div>

      <div className="mb-4 md:col-span-2">
        <label className="block text-lg md:text-2xl font-extrabold mb-4">Mensaje</label>
        <textarea {...register('mensaje_cliente')} className="w-full p-2 border rounded-lg shadow border-[#0E0D35]" rows={10} />
        {errors.mensaje_cliente && <p className="text-red-500">{errors.mensaje_cliente.message}</p>}
      </div>

      <div className="mb-4 md:col-span-2">
        <input type="checkbox" {...register('aceptar_terminos')} className="mr-2" />
        <label className="text-base">
          Al hacer click en el botón usted esta aceptando nuestras políticas de privacidad y política de privacidad
        </label>
        {errors.aceptar_terminos && <p className="text-red-500">{errors.aceptar_terminos.message}</p>}
      </div>

      {successMessage && <p className="text-green-500">{successMessage}</p>}
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}

      <div className='mb-4 md:col-span-2 flex justify-center'>
        <button
          type="submit"
          disabled={isSubmitting}
          className="min-w-max bg-ayllus-primary text-white px-10 py-2 rounded-xl hover:bg-ayllus-secondary disabled:bg-gray-400"
        >
          {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
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

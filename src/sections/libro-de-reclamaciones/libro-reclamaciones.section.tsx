import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useCallback, useState } from 'react'
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3'

const RECAPTCHA_SITE_KEY = import.meta.env.PUBLIC_GOOGLE_SITE_KEY || ''

const documentoValidators = {
  DNI: { regex: /^\d{8}$/, mensaje: 'El DNI debe tener exactamente 8 dígitos numéricos.' },
  RUC: { regex: /^\d{11}$/, mensaje: 'El RUC debe tener exactamente 11 dígitos numéricos.' },
  'CARNET DE EXTRANJERIA': { regex: /^[A-Z0-9]{9,12}$/, mensaje: 'El Carnet de Extranjería debe tener entre 9 y 12 caracteres alfanuméricos.' },
  PASAPORTE: { regex: /^[A-Z0-9]{6,9}$/, mensaje: 'El Pasaporte debe tener entre 6 y 9 caracteres alfanuméricos.' }
}

const baseSchema = z.object({
  documento_identidad: z.enum(['DNI', 'RUC', 'CARNET DE EXTRANJERIA', 'PASAPORTE'], {
    errorMap: () => ({ message: 'Debe seleccionar un tipo de documento válido.' })
  }),
  numero_documento: z.string().min(1, { message: 'El número de documento es obligatorio.' }),
  nombres: z.string().min(1, { message: 'El nombre es obligatorio.' }),
  apellido_paterno: z.string().min(1, { message: 'El apellido paterno es obligatorio.' }),
  apellido_materno: z.string().min(1, { message: 'El apellido materno es obligatorio.' }),
  telefono: z.string().optional(),
  celular: z.string().optional(),
  correo_electronico: z.string().email({ message: 'Debe ingresar un correo electrónico válido.' }),
  domicilio: z.string().min(1, { message: 'El domicilio es obligatorio.' }),
  departamento: z.string().min(1, { message: 'El departamento es obligatorio.' }),
  menor_de_edad: z.boolean(),
  motivo: z.enum(['Producto', 'Servicio'], {
    errorMap: () => ({ message: 'Debe seleccionar un motivo válido.' })
  }),
  descripcion_motivo: z.string().min(1, { message: 'Debe ingresar una descripción del motivo.' }),
  monto_reclamo_motivo: z.string().regex(/^\d+(\.\d{1,2})?$/, { message: 'El monto debe ser un número válido con hasta dos decimales.' }),
  tipo_libro_reclamacion: z.enum(['Reclamo', 'Queja'], {
    errorMap: () => ({ message: 'Debe seleccionar un tipo válido.' })
  }),
  medio_respuesta: z.enum(['Carta', 'Email'], {
    errorMap: () => ({ message: 'Debe seleccionar un medio de respuesta válido.' })
  }),
  detalle: z.string().min(1, { message: 'Debe ingresar un detalle.' }),
  archivos_adjunto: z.array(z.instanceof(File)).optional(),
  pedido: z.string().optional()
})

const schema = z.discriminatedUnion('menor_de_edad', [
  // Cuando menor_de_edad es false
  baseSchema.extend({
    menor_de_edad: z.literal(false),
    documento_identidad_tutor: z.enum(['DNI', 'RUC', 'CARNET DE EXTRANJERIA', 'PASAPORTE']).optional(),
    numero_documento_tutor: z.string().optional(),
    nombres_tutor: z.string().optional(),
    apellido_paterno_tutor: z.string().optional(),
    apellido_materno_tutor: z.string().optional(),
    telefono_tutor: z.string().optional(),
    celular_tutor: z.string().optional(),
    correo_electronico_tutor: z.string().email({ message: 'Debe ingresar un correo válido del tutor.' }).optional()
  }),
  // Cuando menor_de_edad es true
  baseSchema.extend({
    menor_de_edad: z.literal(true),
    documento_identidad_tutor: z.enum(['DNI', 'RUC', 'CARNET DE EXTRANJERIA', 'PASAPORTE']),
    numero_documento_tutor: z.string(),
    nombres_tutor: z.string().min(1, { message: 'El nombre del tutor es obligatorio.' }),
    apellido_paterno_tutor: z.string().min(1, { message: 'El apellido paterno del tutor es obligatorio.' }),
    apellido_materno_tutor: z.string().min(1, { message: 'El apellido materno del tutor es obligatorio.' }),
    telefono_tutor: z.string().optional(),
    celular_tutor: z.string().optional(),
    correo_electronico_tutor: z.string().email({ message: 'Debe ingresar un correo válido del tutor.' })
  })
]).superRefine((data, ctx) => {
  // Validación para documento_identidad
  const validator = documentoValidators[data.documento_identidad]
  if (!validator.regex.test(data.numero_documento)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['numero_documento'],
      message: validator.mensaje
    })
  }

  // Validación para documento_identidad_tutor cuando menor_de_edad es true
  if (data.menor_de_edad && data.documento_identidad_tutor) {
    const validatorTutor = documentoValidators[data.documento_identidad_tutor]
    if (!validatorTutor.regex.test(data.numero_documento_tutor)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['numero_documento_tutor'],
        message: validatorTutor.mensaje
      })
    }
  }
})

type FormData = z.infer<typeof schema>;

function LibroReclamaciones () {
  const [tutorEnabled, setTutorEnabled] = useState(false)
  const { executeRecaptcha } = useGoogleReCaptcha()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const departamentosPeru = [
    'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca', 'Callao', 'Cusco',
    'Huancavelica', 'Huánuco', 'Ica', 'Junín', 'La Libertad', 'Lambayeque', 'Lima',
    'Loreto', 'Madre de Dios', 'Moquegua', 'Pasco', 'Piura', 'Puno', 'San Martín',
    'Tacna', 'Tumbes', 'Ucayali'
  ]

  const companyInfo = {
    name: 'COOPERATIVA DE AHORRO Y CRÉDITO AYLLUS PERÚ LIMITADA',
    ruc: '20603362862',
    address: 'Jr. Sol Nro. 373 (a 2 Cuadras del Parque Sucre)'
  }

  const [currentDate] = useState(() => {
    return new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  })

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
          formData.append(key, String(data[key as keyof FormData] ?? ''))
        }
      })

      formData.append('recaptcha_token', token)

      const response = await fetch('/api/SendReclamacion', {
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
        <div className="bg-gray-50 min-h-screen flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-3xl bg-white shadow-md rounded-md overflow-hidden">
                {/* Encabezado */}
                <div className="bg-ayllus-primary text-white p-4 text-center rounded-t-md">
                    <div className="flex flex-col items-center gap-2">
                        {/* Contenedor de logos */}
                        <div className="flex items-center gap-2">
                            <img
                                src="/logo/isotipo.png"
                                alt="Ayllus Perú Isotipo"
                                className="w-12 md:w-16 p-1 rounded-md"
                            />
                            <img
                                src="/logo/logo.png"
                                alt="Ayllus Perú Logo"
                                className="w-24 md:w-36 p-1 rounded-md"
                            />
                        </div>

                        <h1 className="text-lg md:text-2xl font-bold text-center">
                            Libro de Reclamaciones Virtual
                        </h1>
                    </div>

                    <p className="text-xs md:text-sm mt-2 font-medium">
                        {companyInfo.name} / RUC {companyInfo.ruc}
                    </p>
                    <p className="text-xs md:text-sm">{companyInfo.address}</p>
                </div>

                {/* Fecha */}
                <div className="text-right p-2">
                    <p className="text-xs">
                        Fecha: <span className="font-medium">{currentDate}</span>
                    </p>

                    <p className="text-xs">
                        (*) Campos Obligatorios
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
                    <div>
                        <div className="bg-ayllus-secondary text-white text-center py-1 rounded-md">
                            <h2 className="text-xs font-medium uppercase">Identificación del Consumidor Reclamante</h2>
                        </div>

                        <div className="grid gap-3 mt-3">
                            {/* Documento de Identidad */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
                                <label className="text-xs text-ayllus-text font-medium">Doc. Identidad. (*)</label>
                                <div>
                                    <select
                                        {...register('documento_identidad')}
                                        className="border border-gray-400 bg-white rounded-md px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-ayllus-primary"
                                    >
                                        <option value="DNI">DNI</option>
                                        <option value="RUC">RUC</option>
                                        <option value="CARNET DE EXTRANJERIA">CARNET DE EXTRANJERÍA</option>
                                        <option value="PASAPORTE">PASAPORTE</option>
                                    </select>
                                    {errors.documento_identidad && <p className="text-red-500 text-xs">{errors.documento_identidad.message}</p>}
                                </div>
                            </div>

                            {/* Número de Documento */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
                                <label className="text-xs text-ayllus-text font-medium">Nro Doc (*)</label>
                                <div>
                                    <input
                                        {...register('numero_documento')}
                                        className="border border-gray-400 bg-white rounded-md px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-ayllus-primary"
                                    />
                                    {errors.numero_documento && <p className="text-red-500 text-xs">{errors.numero_documento.message}</p>}
                                </div>
                            </div>

                            {/* Nombres y Apellidos */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
                                <label className="text-xs text-ayllus-text font-medium">Nombres (*)</label>
                                <div>
                                    <input
                                        {...register('nombres')}
                                        className="border border-gray-400 bg-white rounded-md px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-ayllus-primary"
                                    />
                                    {errors.nombres && <p className="text-red-500 text-xs">{errors.nombres.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
                                <label className="text-xs text-ayllus-text font-medium">Apellido Paterno (*)</label>
                                <div>
                                    <input
                                        {...register('apellido_paterno')}
                                        className="border border-gray-400 bg-white rounded-md px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-ayllus-primary"
                                    />
                                    {errors.apellido_paterno && <p className="text-red-500 text-xs">{errors.apellido_paterno.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
                                <label className="text-xs text-ayllus-text font-medium">Apellido Materno (*)</label>
                                <div>
                                    <input
                                        {...register('apellido_materno')}
                                        className="border border-gray-400 bg-white rounded-md px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-ayllus-primary"
                                    />
                                    {errors.apellido_materno && <p className="text-red-500 text-xs">{errors.apellido_materno.message}</p>}
                                </div>
                            </div>

                            {/* Departamento */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
                                <label className="text-xs text-ayllus-text font-medium">Departamento (*)</label>
                                <div>
                                    <select
                                        {...register('departamento')}
                                        className="border border-gray-400 bg-white rounded-md px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-ayllus-primary"
                                    >
                                        {departamentosPeru.map((dep) => (
                                            <option key={dep} value={dep}>{dep}</option>
                                        ))}
                                    </select>
                                    {errors.departamento && <p className="text-red-500 text-xs">{errors.departamento.message}</p>}
                                </div>
                            </div>

                            {/* Correo Electrónico */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
                                <label className="text-xs text-ayllus-text font-medium">Correo Electrónico (*)</label>
                                <div>
                                    <input
                                        {...register('correo_electronico')}
                                        type="text"
                                        className="border border-gray-400 bg-white rounded-md px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-ayllus-primary"
                                    />
                                    {errors.correo_electronico && <p className="text-red-500 text-xs">{errors.correo_electronico.message}</p>}
                                </div>
                            </div>

                            {/* Domicilio */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
                                <label className="text-xs text-ayllus-text font-medium">Domicilio (*)</label>
                                <div>
                                    <input
                                        {...register('domicilio')}
                                        type="text"
                                        className="border border-gray-400 bg-white rounded-md px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-ayllus-primary"
                                    />
                                    {errors.domicilio && <p className="text-red-500 text-xs">{errors.domicilio.message}</p>}
                                </div>
                            </div>

                            {/* Teléfono y Celular */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
                                <label className="text-xs text-ayllus-text font-medium">Teléfono</label>
                                <div>
                                    <input
                                        {...register('telefono')}
                                        type="tel"
                                        className="border border-gray-400 bg-white rounded-md px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-ayllus-primary"
                                    />
                                    {errors.telefono && <p className="text-red-500 text-xs">{errors.telefono.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
                                <label className="text-xs text-ayllus-text font-medium">Celular</label>
                                <div>
                                    <input
                                        {...register('celular')}
                                        type="tel"
                                        className="border border-gray-400 bg-white rounded-md px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-ayllus-primary"
                                    />
                                    {errors.celular && <p className="text-red-500 text-xs">{errors.celular.message}</p>}
                                </div>
                            </div>

                            {/* Checkbox para datos de tutor */}
                            <div className="flex items-center gap-2">
                                <input
                                    {...register('menor_de_edad')}
                                    type="checkbox"
                                    id="tutor_checkbox"
                                    onChange={() => setTutorEnabled(!tutorEnabled)}
                                    className="accent-ayllus-primary"
                                />
                                <label htmlFor="tutor_checkbox" className="text-xs text-ayllus-text font-medium">Es Menor de Edad</label>
                            </div>

                            {/* Campos del Tutor */}
                            {tutorEnabled && (
                                <div className="grid gap-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
                                        <label className="text-xs text-ayllus-text font-medium">Doc. Identidad Tutor (*)</label>
                                        <div>
                                            <select
                                                {...register('documento_identidad_tutor')}
                                                className="border border-gray-400 bg-white rounded-md px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-ayllus-primary"
                                            >
                                                <option value="DNI">DNI</option>
                                                <option value="RUC">RUC</option>
                                                <option value="CARNET DE EXTRANJERIA">CARNET DE EXTRANJERÍA</option>
                                                <option value="PASAPORTE">PASAPORTE</option>
                                            </select>
                                            {errors.documento_identidad_tutor && <p className="text-red-500 text-xs">{errors.documento_identidad_tutor.message}</p>}
                                        </div>
                                    </div>

                                    {[
                                      ['numero_documento_tutor', 'Número de Documento Tutor (*)', 'text'],
                                      ['nombres_tutor', 'Nombres Tutor (*)', 'text'],
                                      ['apellido_paterno_tutor', 'Apellido Paterno Tutor (*)', 'text'],
                                      ['apellido_materno_tutor', 'Apellido Materno Tutor (*)', 'text'],
                                      ['telefono_tutor', 'Teléfono Tutor', 'tel'],
                                      ['celular_tutor', 'Celular Tutor', 'tel'],
                                      ['correo_electronico_tutor', 'Correo Electrónico Tutor (*)', 'text']
                                    ].map(([name, label, type]) => (
                                        <div key={name} className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
                                            <label className="text-xs text-ayllus-text font-medium">{label}</label>
                                            <div>
                                                <input
                                                    {...register(name as keyof FormData)}
                                                    type={type}
                                                    className="border border-gray-400 bg-white rounded-md px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-ayllus-primary"
                                                />
                                                {errors[name as keyof FormData] && <p className="text-red-500 text-xs">{errors[name as keyof FormData]?.message}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Identificación del bien contratado */}
                    <div>
                        <div className="bg-ayllus-secondary text-white text-center py-1 rounded-md">
                            <h2 className="text-xs font-medium uppercase">Identificación del Bien Contratado</h2>
                        </div>

                        <div className="grid gap-3 mt-3">
                            <fieldset className="border border-gray-300 rounded-md p-3">
                                <legend className="text-xs font-medium text-ayllus-title">Su reclamo es por un:</legend>
                                <div className="flex gap-4 mt-2">
                                    <label className="inline-flex items-center text-xs">
                                        <input
                                            {...register('motivo')}
                                            type="radio"
                                            value="Producto"
                                            className="mr-1 accent-ayllus-primary"
                                            defaultChecked
                                        />
                                        Producto
                                    </label>
                                    <label className="inline-flex items-center text-xs">
                                        <input
                                            {...register('motivo')}
                                            type="radio"
                                            value="Servicio"
                                            className="mr-1 accent-ayllus-primary"
                                        />
                                        Servicio
                                    </label>
                                </div>
                                {errors.motivo && <p className="text-red-500 text-xs">{errors.motivo.message}</p>}
                            </fieldset>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
                                <label className="text-xs text-ayllus-text font-medium">Descripción (*):</label>
                                <div>
                                    <input
                                        {...register('descripcion_motivo')}
                                        type="text"
                                        className="border border-gray-400 bg-white rounded-md px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-ayllus-primary"
                                    />
                                    {errors.descripcion_motivo && <p className="text-red-500 text-xs">{errors.descripcion_motivo.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
                                <label className="text-xs text-ayllus-text font-medium">Monto Reclamado (*):</label>
                                <div>
                                    <input
                                        {...register('monto_reclamo_motivo')}
                                        type="text"
                                        className="border border-gray-400 bg-white rounded-md px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-ayllus-primary"
                                    />
                                    {errors.monto_reclamo_motivo && <p className="text-red-500 text-xs">{errors.monto_reclamo_motivo.message}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detalle de la reclamación */}
                    <div>
                        <div className="bg-ayllus-secondary text-white text-center py-1 rounded-md">
                            <h2 className="text-xs font-medium uppercase">Detalle de la Reclamación y Pedido del Consumidor</h2>
                        </div>

                        <div className="mt-3 space-y-3">
                            <fieldset className="border border-gray-300 p-3 rounded-md">
                                <legend className="text-xs font-medium text-ayllus-title">Tipo de Solicitud</legend>
                                <div className="flex gap-4 mt-2">
                                    <label className="inline-flex items-center text-xs">
                                        <input
                                            {...register('tipo_libro_reclamacion')}
                                            type="radio"
                                            value="Reclamo"
                                            className="mr-1 accent-ayllus-primary"
                                            defaultChecked
                                        />
                                        Reclamo
                                    </label>
                                    <label className="inline-flex items-center text-xs">
                                        <input
                                            {...register('tipo_libro_reclamacion')}
                                            type="radio"
                                            value="Queja"
                                            className="mr-1 accent-ayllus-primary"
                                        />
                                        Queja
                                    </label>
                                </div>
                                {errors.tipo_libro_reclamacion && <p className="text-red-500 text-xs">{errors.tipo_libro_reclamacion.message}</p>}
                            </fieldset>

                            <fieldset className="border border-gray-300 p-3 rounded-md">
                                <legend className="text-xs font-medium text-ayllus-title">Medio de Respuesta</legend>
                                <div className="flex gap-4 mt-2">
                                    <label className="inline-flex items-center text-xs">
                                        <input
                                            {...register('medio_respuesta')}
                                            type="radio"
                                            value="Carta"
                                            className="mr-1 accent-ayllus-primary"
                                            defaultChecked
                                        />
                                        Carta
                                    </label>
                                    <label className="inline-flex items-center text-xs">
                                        <input
                                            {...register('medio_respuesta')}
                                            type="radio"
                                            value="Email"
                                            className="mr-1 accent-ayllus-primary"
                                        />
                                        E-Mail
                                    </label>
                                </div>
                                {errors.medio_respuesta && <p className="text-red-500 text-xs">{errors.medio_respuesta.message}</p>}
                            </fieldset>

                            <div>
                                <label className="block text-xs font-medium text-ayllus-title">Detalle (máx. 5000 caracteres) (*):</label>
                                <textarea
                                    {...register('detalle')}
                                    rows={4}
                                    maxLength={5000}
                                    className="w-full border border-gray-400 rounded-md p-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-ayllus-primary"
                                />
                                {errors.detalle && <p className="text-red-500 text-xs">{errors.detalle.message}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-ayllus-title">Pedido (máx. 5000 caracteres):</label>
                                <textarea
                                    {...register('pedido')}
                                    rows={4}
                                    maxLength={5000}
                                    className="w-full border border-gray-400 rounded-md p-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-ayllus-primary"
                                />
                                {errors.pedido && <p className="text-red-500 text-xs">{errors.pedido.message}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-ayllus-title">Adjuntar Archivos (imágenes o PDF):</label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*,application/pdf"
                                    onChange={(e) => setValue('archivos_adjunto', Array.from(e.target.files || []))}
                                    className="w-full border border-gray-400 rounded-md p-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-ayllus-primary"
                                />
                                {errors.archivos_adjunto && <p className="text-red-500 text-xs">{errors.archivos_adjunto.message}</p>}
                            </div>
                        </div>
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
            </div>
        </div>
  )
}

export default function LibroReclamacionesFormWrapper () {
  return <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_SITE_KEY}>
        <LibroReclamaciones />
    </GoogleReCaptchaProvider>
}

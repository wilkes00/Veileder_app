import React, { useState } from 'react'
import { FaUser, FaLock, FaGraduationCap, FaEnvelope, FaUserCircle, FaGraduationCap as FaCareer, FaBook } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    career: '',
    email: '',
    password: '',
    confirmPassword: '',
    subjects: [] as string[]
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const accountType = localStorage.getItem('accountType') || 'student'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubjectChange = (subject: string) => {
    setFormData(prevData => ({
      ...prevData,
      subjects: prevData.subjects.includes(subject)
        ? prevData.subjects.filter(s => s !== subject)
        : [...prevData.subjects, subject]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setLoading(false)
      return
    }

    if (formData.subjects.length === 0) {
      setError(accountType === 'professor' 
        ? 'Por favor, selecciona al menos una materia que impartes'
        : 'Por favor, selecciona al menos una materia de tu interés')
      setLoading(false)
      return
    }

    try {
      // Verificar si el correo ya está registrado
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', formData.email)
        .single()

      if (existingUser) {
        setError('Este correo electrónico ya está registrado. Por favor, utiliza otro correo o inicia sesión.')
        setLoading(false)
        return
      }

      // Registrar usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            username: formData.username,
            career: formData.career,
            account_type: accountType,
            subjects: formData.subjects
          }
        }
      })

      if (authError) throw authError

      // Registro exitoso
      setSuccess('¡Registro exitoso! Por favor inicia sesión.')
      localStorage.removeItem('accountType') // Limpiar el tipo de cuenta
      setTimeout(() => {
        navigate('/')
      }, 2000)
    } catch (error: any) {
      if (error.message.includes('already registered')) {
        setError('Este correo electrónico ya está registrado. Por favor, utiliza otro correo o inicia sesión.')
      } else {
        setError(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const careers = [
    'Ingeniería en Sistemas Inteligentes',
    'Ingeniería Civil',
    'Ingeniería Mecánica',
    'Ingeniería Eléctrica',
    'Ingeniería en Computación',
    'Ingeniería en Mecatrónica',
    'Ingeniería Ambiental',
    'Ingeniería Metalúrgica y de Materiales',
    'Ingeniería Química',
    'Ingeniería en Geomática',
    'Ingeniería en Geología',
    'Ingeniería en Agronomía',
    'Ingeniería Mecánica Administrativa',
    'Ingeniería Mecánica Eléctrica',
    'Ingeniería en Electricidad y Automatización',
    'Ingeniería en Topografía y Construcción'
  ]

  const subjects = [
    'Cálculo A',
    'Cálculo D',
    'Estructuras de Datos I',
    'Estructuras de Datos II',
    'Álgebra B',
    'Electricidad y Magnetismo',
    'Termodinámica'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center">
          <div className="text-white mb-8 flex items-center">
            <FaGraduationCap className="text-4xl mr-2" />
            <h1 className="text-3xl font-bold">Veileder</h1>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Registro de {accountType === 'professor' ? 'Profesor' : 'Estudiante'}
            </h2>

            {error && (
              <div className="mb-4 p-3 rounded bg-red-100 border border-red-400 text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 rounded bg-green-100 border border-green-400 text-green-700">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  <div className="flex items-center">
                    <FaUser className="mr-2" />
                    Nombre completo
                  </div>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Juan Pérez García"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  <div className="flex items-center">
                    <FaUserCircle className="mr-2" />
                    Nombre de usuario
                  </div>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="juanpg"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  <div className="flex items-center">
                    <FaCareer className="mr-2" />
                    {accountType === 'professor' ? 'Especialidad' : 'Carrera'}
                  </div>
                </label>
                <select
                  name="career"
                  value={formData.career}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">
                    {accountType === 'professor' 
                      ? 'Selecciona tu especialidad' 
                      : 'Selecciona tu carrera'}
                  </option>
                  {careers.map((career) => (
                    <option key={career} value={career}>
                      {career}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  <div className="flex items-center">
                    <FaBook className="mr-2" />
                    {accountType === 'professor' ? 'Materias que impartes' : 'Materias de interés'}
                  </div>
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
                  {subjects.map((subject) => (
                    <label key={subject} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={formData.subjects.includes(subject)}
                        onChange={() => handleSubjectChange(subject)}
                        className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  <div className="flex items-center">
                    <FaEnvelope className="mr-2" />
                    Correo electrónico
                  </div>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="tucorreo@gmail.com"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  <div className="flex items-center">
                    <FaLock className="mr-2" />
                    Contraseña
                  </div>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  <div className="flex items-center">
                    <FaLock className="mr-2" />
                    Confirmar contraseña
                  </div>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-colors ${
                  loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
                }`}
              >
                {loading ? 'Procesando...' : 'Registrarse'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">¿Ya tienes una cuenta?</p>
              <button
                onClick={() => navigate('/')}
                className="text-blue-500 font-semibold hover:text-blue-600 mt-1"
              >
                Inicia sesión aquí
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
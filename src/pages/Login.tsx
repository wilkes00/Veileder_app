import React, { useState } from 'react'
import { FaUser, FaLock, FaGraduationCap } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        if (signInError.message === 'Invalid login credentials') {
          throw new Error('Correo o contraseña incorrectos. Por favor verifica tus datos.')
        }
        throw signInError
      }

      if (!authData.user) {
        throw new Error('No se pudo iniciar sesión. Por favor intenta de nuevo.')
      }

      // Fetch user profile data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle()

      if (userError) throw userError

      if (!userData) {
        throw new Error('No se encontró el perfil de usuario.')
      }

      setSuccess('¡Inicio de sesión exitoso!')
      navigate('/home')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async (e: React.MouseEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    if (!email) {
      setError('Por favor ingresa tu correo electrónico para restablecer tu contraseña')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        throw error
      }

      setSuccess('Se ha enviado un enlace para restablecer tu contraseña a tu correo electrónico')
      setIsResettingPassword(false)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

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
              {isResettingPassword ? 'Restablecer contraseña' : 'Inicia sesión para conectar'}
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

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  <div className="flex items-center">
                    <FaUser className="mr-2" />
                    Correo electrónico
                  </div>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="tucorreo@gmail.com"
                  required
                />
              </div>

              {!isResettingPassword && (
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    <div className="flex items-center">
                      <FaLock className="mr-2" />
                      Contraseña
                    </div>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              )}

              {isResettingPassword ? (
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  disabled={loading}
                  className={`w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-colors ${
                    loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
                  }`}
                >
                  {loading ? 'Procesando...' : 'Enviar enlace de restablecimiento'}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-colors ${
                    loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
                  }`}
                >
                  {loading ? 'Procesando...' : 'Iniciar sesión'}
                </button>
              )}
            </form>

            <div className="mt-6 text-center space-y-2">
              {!isResettingPassword && (
                <>
                  <button
                    onClick={() => setIsResettingPassword(true)}
                    className="text-blue-500 text-sm hover:text-blue-600"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>

                  <div>
                    <p className="text-gray-600">¿No tienes una cuenta?</p>
                    <button 
                      onClick={() => navigate('/account-type')}
                      disabled={loading}
                      className={`text-blue-500 font-semibold hover:text-blue-600 mt-1 ${
                        loading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      Regístrate aquí
                    </button>
                  </div>
                </>
              )}

              {isResettingPassword && (
                <button
                  onClick={() => setIsResettingPassword(false)}
                  className="text-blue-500 text-sm hover:text-blue-600"
                >
                  Volver al inicio de sesión
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
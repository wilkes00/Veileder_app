import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGraduationCap, FaSearch, FaUsers, FaChalkboardTeacher, FaCog, FaSignOutAlt, FaKey, FaUser } from 'react-icons/fa';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  full_name: string;
  username: string;
  career: string;
  account_type: string;
  subjects: string[];
}

function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'students' | 'professors' | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<User[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchType) {
      setError('Por favor selecciona una categoría de búsqueda');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/');
        return;
      }

      let query = supabase
        .from('users')
        .select('*')
        .eq('account_type', searchType === 'professors' ? 'professor' : 'student');

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%,subjects.cs.{${searchQuery}}`);
      }

      const { data, error } = await query;

      if (error) throw error;

      setSearchResults(data as User[]);
      setError(null);
    } catch (error: any) {
      setError('Error al buscar usuarios: ' + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (error: any) {
      console.error('Error al cerrar sesión:', error.message);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) throw error;

      setSuccess('Contraseña actualizada exitosamente');
      setShowPasswordChange(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center">
          <div className="text-white mb-8 flex items-center justify-between w-full max-w-4xl">
            <div className="flex items-center">
              <FaGraduationCap className="text-4xl mr-2" />
              <h1 className="text-3xl font-bold">Veileder</h1>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <FaCog className="text-2xl" />
            </button>
          </div>

          {showSettings && (
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-4xl mb-8">
              <h2 className="text-2xl font-bold mb-6">Ajustes</h2>
              
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

              <div className="space-y-4">
                {!showPasswordChange ? (
                  <button
                    onClick={() => setShowPasswordChange(true)}
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg w-full"
                  >
                    <FaKey className="mr-3" />
                    Cambiar contraseña
                  </button>
                ) : (
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Nueva contraseña
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        placeholder="Nueva contraseña"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Confirmar nueva contraseña
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        placeholder="Confirmar nueva contraseña"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                      >
                        Guardar cambios
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordChange(false);
                          setError(null);
                          setSuccess(null);
                        }}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg w-full"
                >
                  <FaSignOutAlt className="mr-3" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-4xl">
            <div className="mb-8">
              <form onSubmit={handleSearch} className="flex gap-4 mb-6">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre, usuario o materia..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 flex items-center"
                >
                  <FaSearch className="mr-2" />
                  Buscar
                </button>
              </form>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div
                className={`p-6 rounded-lg cursor-pointer transition-all ${
                  searchType === 'students'
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : 'bg-gray-50 hover:bg-blue-50'
                }`}
                onClick={() => setSearchType('students')}
              >
                <div className="flex items-center mb-4">
                  <FaUsers className="text-3xl text-blue-500 mr-3" />
                  <h2 className="text-xl font-semibold">Grupos de Estudio</h2>
                </div>
                <p className="text-gray-600">
                  Encuentra otros estudiantes para formar grupos de estudio y colaborar en proyectos académicos.
                </p>
              </div>

              <div
                className={`p-6 rounded-lg cursor-pointer transition-all ${
                  searchType === 'professors'
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : 'bg-gray-50 hover:bg-blue-50'
                }`}
                onClick={() => setSearchType('professors')}
              >
                <div className="flex items-center mb-4">
                  <FaChalkboardTeacher className="text-3xl text-blue-500 mr-3" />
                  <h2 className="text-xl font-semibold">Profesores y Tutores</h2>
                </div>
                <p className="text-gray-600">
                  Conecta con profesores y tutores especializados en materias específicas para recibir apoyo académico.
                </p>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Resultados de búsqueda</h3>
              {searchResults.length > 0 ? (
                <div className="space-y-4">
                  {searchResults.map((user) => (
                    <div key={user.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-lg font-semibold">{user.full_name}</h4>
                          <p className="text-gray-600">@{user.username}</p>
                          <p className="text-sm text-gray-500">{user.career}</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 font-medium">
                          {user.account_type === 'professor' ? 'Materias que imparte:' : 'Materias de interés:'}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {user.subjects.map((subject, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                            >
                              {subject}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-600 text-center">
                  {searchType 
                    ? 'No se encontraron resultados para tu búsqueda.'
                    : 'Selecciona una categoría y realiza una búsqueda para ver los resultados.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
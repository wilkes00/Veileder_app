import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGraduationCap, FaSearch, FaUsers, FaChalkboardTeacher, FaCog, FaSignOutAlt, FaKey, FaUser, FaPlus } from 'react-icons/fa';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  full_name: string;
  username: string;
  career: string;
  account_type: string;
  subjects: string[];
}

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  subject: string;
  creator_id: string;
  max_participants: number;
  creator?: User;
  member_count?: number;
}

function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'students' | 'professors' | 'groups' | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [groupResults, setGroupResults] = useState<StudyGroup[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    full_name: '',
    username: '',
    career: '',
    subjects: [] as string[]
  });
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    subject: '',
    max_participants: 10
  });

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) throw authError;
        
        if (!user) {
          navigate('/');
          return;
        }

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (userError) {
          if (userError.message.includes('JSON object requested, multiple (or no) rows returned')) {
            // User not found in the users table
            navigate('/');
            return;
          }
          throw userError;
        }

        if (!userData) {
          // User authenticated but no profile exists
          navigate('/');
          return;
        }

        setCurrentUser(userData);
        setUserForm({
          full_name: userData.full_name,
          username: userData.username,
          career: userData.career,
          subjects: userData.subjects || []
        });
      } catch (error: any) {
        console.error('Error fetching user data:', error.message);
        // On any error, redirect to login
        navigate('/');
      }
    };

    fetchCurrentUser();
  }, [navigate]);

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

      if (searchType === 'groups') {
        let query = supabase
          .from('study_groups')
          .select(`
            *,
            creator:creator_id(full_name, username),
            member_count:group_members(count)
          `);

        if (searchQuery) {
          query = query.or(`name.ilike.%${searchQuery}%,subject.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        }

        const { data, error: searchError } = await query;

        if (searchError) throw searchError;
        setGroupResults(data || []);
        setSearchResults([]);
      } else {
        let query = supabase
          .from('users')
          .select('*')
          .neq('id', user.id)
          .eq('account_type', searchType === 'professors' ? 'professor' : 'student');

        if (searchQuery) {
          query = query.or(`full_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`);
        }

        const { data, error: searchError } = await query;

        if (searchError) throw searchError;

        const filteredData = searchQuery
          ? data?.filter(user => 
              user.subjects?.some(subject => 
                subject.toLowerCase().includes(searchQuery.toLowerCase())
              )
            ) || []
          : data || [];

        setSearchResults(filteredData);
        setGroupResults([]);
      }
      
      setError(null);
    } catch (error: any) {
      setError('Error al buscar: ' + error.message);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/');
        return;
      }

      const { data: group, error: groupError } = await supabase
        .from('study_groups')
        .insert([
          {
            ...newGroup,
            creator_id: user.id
          }
        ])
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert([
          {
            group_id: group.id,
            user_id: user.id,
            role: 'admin'
          }
        ]);

      if (memberError) throw memberError;

      setSuccess('Grupo creado exitosamente');
      setShowCreateGroup(false);
      setNewGroup({
        name: '',
        description: '',
        subject: '',
        max_participants: 10
      });

      // Refresh search results if we're viewing groups
      if (searchType === 'groups') {
        handleSearch(e);
      }
    } catch (error: any) {
      setError('Error al crear el grupo: ' + error.message);
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

  const handleSubjectChange = (subject: string) => {
    setUserForm(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: userForm.full_name,
          username: userForm.username,
          career: userForm.career,
          subjects: userForm.subjects
        })
        .eq('id', currentUser?.id);

      if (error) throw error;

      setSuccess('Perfil actualizado exitosamente');
      setShowAccountSettings(false);
      
      // Update current user state
      setCurrentUser(prev => prev ? {
        ...prev,
        ...userForm
      } : null);
    } catch (error: any) {
      setError('Error al actualizar el perfil: ' + error.message);
    }
  };

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
  ];

  const professorTitles = [
    'Doctor',
    'Maestro en Ciencias',
    'Maestro en Ingeniería',
    'Ingeniero',
    'Licenciado',
    'Profesor Investigador',
    'Profesor Titular',
    'Profesor Asociado',
    'Tutor Académico',
    'Instructor Certificado'
  ];

  const subjects = [
    'Cálculo A',
    'Cálculo D',
    'Estructuras de Datos I',
    'Estructuras de Datos II',
    'Álgebra B',
    'Electricidad y Magnetismo',
    'Termodinámica'
  ];

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
                <button
                  onClick={() => {
                    setShowAccountSettings(true);
                    setShowPasswordChange(false);
                  }}
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg w-full"
                >
                  <FaUser className="mr-3" />
                  Mi Cuenta
                </button>

                {!showPasswordChange && !showAccountSettings && (
                  <button
                    onClick={() => setShowPasswordChange(true)}
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg w-full"
                  >
                    <FaKey className="mr-3" />
                    Cambiar contraseña
                  </button>
                )}

                {showPasswordChange && (
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

                {showAccountSettings && (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        value={userForm.full_name}
                        onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Nombre de usuario
                      </label>
                      <input
                        type="text"
                        value={userForm.username}
                        onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        {currentUser?.account_type === 'professor' ? 'Título Académico' : 'Carrera'}
                      </label>
                      <select
                        value={userForm.career}
                        onChange={(e) => setUserForm({ ...userForm, career: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        required
                      >
                        <option value="">Selecciona una opción</option>
                        {(currentUser?.account_type === 'professor' ? professorTitles : careers).map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        {currentUser?.account_type === 'professor' ? 'Materias que impartes' : 'Materias de interés'}
                      </label>
                      <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
                        {subjects.map((subject) => (
                          <label key={subject} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input
                              type="checkbox"
                              checked={userForm.subjects.includes(subject)}
                              onChange={() => handleSubjectChange(subject)}
                              className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                            />
                            <span className="text-gray-700">{subject}</span>
                          </label>
                        ))}
                      </div>
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
                          setShowAccountSettings(false);
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

          {showCreateGroup && (
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-4xl mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Crear Grupo de Estudio</h2>
                <button
                  onClick={() => setShowCreateGroup(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Nombre del grupo
                  </label>
                  <input
                    type="text"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Ej: Grupo de Cálculo A"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Describe el propósito del grupo..."
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Materia
                  </label>
                  <select
                    value={newGroup.subject}
                    onChange={(e) => setNewGroup({ ...newGroup, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  >
                    <option value="">Selecciona una materia</option>
                    {subjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Máximo de participantes
                  </label>
                  <input
                    type="number"
                    value={newGroup.max_participants}
                    onChange={(e) => setNewGroup({ ...newGroup, max_participants: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    min="2"
                    max="50"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateGroup(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Crear Grupo
                  </button>
                </div>
              </form>
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

            <div className="grid md:grid-cols-3 gap-6">
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
                  <h2 className="text-xl font-semibold">Estudiantes</h2>
                </div>
                <p className="text-gray-600">
                  Encuentra otros estudiantes para colaborar.
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
                  <h2 className="text-xl font-semibold">Profesores</h2>
                </div>
                <p className="text-gray-600">
                  Conecta con profesores y tutores.
                </p>
              </div>

              <div
                className={`p-6 rounded-lg cursor-pointer transition-all ${
                  searchType === 'groups'
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : 'bg-gray-50 hover:bg-blue-50'
                }`}
                onClick={() => setSearchType('groups')}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <FaUsers className="text-3xl text-blue-500 mr-3" />
                    <h2 className="text-xl font-semibold">Grupos</h2>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCreateGroup(true);
                    }}
                    className="p-2 text-blue-500 hover:bg-blue-100 rounded-full"
                    title="Crear grupo"
                  >
                    <FaPlus />
                  </button>
                </div>
                <p className="text-gray-600">
                  Únete a grupos de estudio.
                </p>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Resultados de búsqueda</h3>
              
              {searchType === 'groups' ? (
                groupResults.length > 0 ? (
                  <div className="space-y-4">
                    {groupResults.map((group) => (
                      <div key={group.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-lg font-semibold">{group.name}</h4>
                            <p className="text-gray-600">{group.description}</p>
                            <p className="text-sm text-gray-500 mt-2">
                              Creado por: {group.creator?.full_name} (@{group.creator?.username})
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                              {group.subject}
                            </span>
                            <p className="text-sm text-gray-500 mt-2">
                              {group.member_count?.[0].count || 0}/{group.max_participants} miembros
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-600 text-center">
                    No se encontraron grupos. ¿Por qué no creas uno?
                  </div>
                )
              ) : searchResults.length > 0 ? (
                <div className="space-y-4">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="bg-white p-4 rounded-lg shadow border border-gray-200 cursor-pointer hover:border-blue-500 transition-colors"
                      onClick={() => navigate(`/user/${user.username}`)}
                    >
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
                          {user.subjects?.map((subject, index) => (
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
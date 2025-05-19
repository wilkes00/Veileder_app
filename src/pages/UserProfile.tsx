import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaGraduationCap, FaEnvelope, FaArrowLeft, FaUserCircle } from 'react-icons/fa';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  full_name: string;
  username: string;
  career: string;
  account_type: string;
  subjects: string[];
}

function UserProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Get current user
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          navigate('/');
          return;
        }
        setCurrentUser(authUser);

        // Get profile user
        const { data: users, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', username)
          .single();

        if (error) throw error;
        setUser(users);
      } catch (error: any) {
        console.error('Error fetching user:', error.message);
        setError('Error al cargar el perfil del usuario');
      }
    };

    fetchUsers();
  }, [username, navigate]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: currentUser.id,
            receiver_id: user?.id,
            content: message,
          }
        ]);

      if (error) throw error;

      setSuccess('Mensaje enviado exitosamente');
      setMessage('');
    } catch (error: any) {
      setError('Error al enviar el mensaje: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-xl">
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center">
          <div className="text-white mb-8 flex items-center justify-between w-full max-w-2xl">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-white hover:text-gray-200 transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Volver
            </button>
            <div className="flex items-center">
              <FaGraduationCap className="text-4xl mr-2" />
              <h1 className="text-3xl font-bold">Veileder</h1>
            </div>
            <div className="w-24"></div>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl">
            <div className="flex items-start space-x-6 mb-6">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                  {getInitials(user.full_name)}
                </div>
              </div>
              <div className="flex-grow">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {user.full_name}
                  </h2>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {user.account_type === 'professor' ? 'Profesor' : 'Estudiante'}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">@{user.username}</p>
                <p className="text-gray-700 font-medium">
                  {user.account_type === 'professor' ? 'Título:' : 'Carrera:'}{' '}
                  <span className="font-normal">{user.career}</span>
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 mb-6">
              <h3 className="text-lg font-semibold mb-3">
                {user.account_type === 'professor'
                  ? 'Materias que imparte:'
                  : 'Materias de interés:'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.subjects?.map((subject, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>

            {currentUser && currentUser.id !== user.id && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <FaEnvelope className="mr-2" />
                  Enviar mensaje
                </h3>

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

                <form onSubmit={handleSendMessage} className="space-y-4">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escribe tu mensaje..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 min-h-[100px]"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-colors ${
                      loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
                    }`}
                  >
                    {loading ? 'Enviando...' : 'Enviar mensaje'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
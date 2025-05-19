import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGraduationCap, FaUserGraduate, FaChalkboardTeacher } from 'react-icons/fa';

function AccountType() {
  const navigate = useNavigate();

  const handleAccountTypeSelection = (type: 'student' | 'professor') => {
    if (type === 'professor') {
      navigate('/subscription');
    } else {
      navigate('/register');
    }
    localStorage.setItem('accountType', type);
  };

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
              Selecciona tu tipo de cuenta
            </h2>

            <div className="space-y-4">
              <button
                onClick={() => handleAccountTypeSelection('student')}
                className="w-full p-6 text-left bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors border-2 border-transparent hover:border-blue-500"
              >
                <div className="flex items-center mb-2">
                  <FaUserGraduate className="text-3xl text-blue-500 mr-3" />
                  <h3 className="text-xl font-semibold">Estudiante</h3>
                </div>
                <p className="text-gray-600">
                  Únete a grupos de estudio y conecta con otros estudiantes
                </p>
              </button>

              <button
                onClick={() => handleAccountTypeSelection('professor')}
                className="w-full p-6 text-left bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors border-2 border-transparent hover:border-blue-500"
              >
                <div className="flex items-center mb-2">
                  <FaChalkboardTeacher className="text-3xl text-blue-500 mr-3" />
                  <h3 className="text-xl font-semibold">Profesor</h3>
                </div>
                <p className="text-gray-600">
                  Ofrece tus servicios como profesor o tutor
                </p>
              </button>
            </div>

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
  );
}

export default AccountType
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGraduationCap, FaCrown } from 'react-icons/fa';

function Subscription() {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate('/register');
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
            <div className="flex items-center justify-center mb-6">
              <FaCrown className="text-4xl text-yellow-500 mr-3" />
              <h2 className="text-2xl font-bold text-gray-800">
                Cuenta de Profesor
              </h2>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold text-blue-800 mb-4">
                Suscripción Mensual
              </h3>
              <div className="text-3xl font-bold text-blue-900 mb-4">
                $200 MXN<span className="text-lg font-normal text-blue-700">/mes</span>
              </div>
              <ul className="space-y-2 text-blue-700">
                <li>✓ Perfil verificado como profesor</li>
                <li>✓ Listado destacado en búsquedas</li>
                <li>✓ Herramientas de gestión de estudiantes</li>
                <li>✓ Soporte prioritario</li>
              </ul>
            </div>

            <p className="text-gray-600 mb-6 text-center">
              Al continuar, podrás completar tu registro y configurar el pago de la suscripción.
            </p>

            <button
              onClick={handleContinue}
              className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Continuar con el registro
            </button>

            <button
              onClick={() => navigate('/account-type')}
              className="w-full mt-4 text-blue-500 hover:text-blue-600 font-semibold"
            >
              Volver a selección de cuenta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Subscription
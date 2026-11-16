import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 mb-3 border border-white/20">
            <Lock size={32} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Recuperar contraseña</h1>
          <p className="text-blue-200 mt-1 text-sm">Colegio Bernardo O'Higgins</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Solicita ayuda a UTP</h2>
          <p className="text-sm text-gray-600 mb-6">
            Por seguridad, el sistema no permite restablecer una contraseña usando solo el RUT. Contacta a UTP para verificar tu identidad y solicitar el cambio.
          </p>
          <button onClick={() => navigate('/login')} className="btn-primary w-full py-3">
            <span className="inline-flex items-center justify-center gap-2">
              <ArrowLeft size={16} />
              Volver a iniciar sesión
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

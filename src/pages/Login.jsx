import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../api/auth';
import { School, Lock, User, AlertCircle, Eye, EyeOff, LogIn } from 'lucide-react';

export default function Login() {
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login: authLogin, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginApi({ rut, password });
      authLogin({
        token: response.token,
        rut: response.rut,
        role: response.role,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          setError('RUT o contraseña incorrectos. Verifica tus credenciales.');
        } else if (err.response.status >= 500) {
          setError('Error interno del servidor. Revisa que todos los servicios estén funcionando.');
        } else {
          setError(`Error del servidor (${err.response.status}): ${err.response.data?.error || 'Error desconocido'}`);
        }
      } else if (err.request) {
        setError('No se puede conectar con el servidor. Asegúrate de tener los servicios backend ejecutándose:\n\n' +
          '  1. docker-compose up -d\n' +
          '  2. Espera que todos los servicios estén saludables\n' +
          '  3. Verifica que localhost:9090 esté accesible');
      } else {
        setError('Error al conectar: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const quickAccess = [
    { rut: '77777777-7', password: 'utp123', label: '🔷 UTP', group: 'admin' },
    // Profesores
    { rut: '11111111-1', password: 'profesor123', label: 'Carlos (Mate)', group: 'prof' },
    { rut: '22222222-2', password: 'profesor123', label: 'Laura (Lenguaje)', group: 'prof' },
    { rut: '66666666-6', password: 'profesor123', label: 'Patricia (Inglés)', group: 'prof' },
    { rut: '12121212-1', password: 'profesor123', label: 'Roberto (Cs.)', group: 'prof' },
    { rut: '13131313-3', password: 'profesor123', label: 'Ana (Historia)', group: 'prof' },
    { rut: '14141414-4', password: 'profesor123', label: 'Fernando (EF)', group: 'prof' },
    { rut: '15151515-5', password: 'profesor123', label: 'Daniela (Artes)', group: 'prof' },
    // Alumnos
    { rut: '33333333-3', password: 'alumno123', label: 'Ana Soto (1°B)', group: 'students' },
    { rut: '44444444-4', password: 'alumno123', label: 'Pedro R. (1°B)', group: 'students' },
    { rut: '16161616-6', password: 'alumno123', label: 'Camila T. (2°B)', group: 'students' },
    { rut: '27272727-7', password: 'alumno123', label: 'Florencia A. (5°B)', group: 'students' },
    { rut: '31313131-1', password: 'alumno123', label: 'Josefina H. (7°B)', group: 'students' },
    { rut: '38383838-8', password: 'alumno123', label: 'Isabella N. (2°M)', group: 'students' },
    { rut: '43434343-3', password: 'alumno123', label: 'Diego S. (4°M)', group: 'students' },
    // Apoderados
    { rut: '55555555-5', password: 'apoderado123', label: 'María Soto (Apod.)', group: 'guardians' },
    { rut: '45454545-5', password: 'apoderado123', label: 'Pedro Cruz (Apod.)', group: 'guardians' },
    { rut: '51515151-1', password: 'apoderado123', label: 'Gloria P. (Apod.)', group: 'guardians' },
  ];

  const quickGroups = [
    { key: 'admin', title: 'Administración' },
    { key: 'prof', title: 'Profesores' },
    { key: 'students', title: 'Estudiantes' },
    { key: 'guardians', title: 'Apoderados' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm mb-4 border border-white/20">
            <School size={40} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Colegio Bernardo O'Higgins</h1>
          <p className="text-blue-200 mt-1 text-sm">Sistema de Gestión Escolar</p>
        </div>

        {/* Login form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <LogIn size={20} className="text-blue-700" />
            Iniciar Sesión
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">RUT</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={rut}
                  onChange={(e) => setRut(e.target.value)}
                  placeholder="12.345.678-9"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={18} />
                  Ingresar
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <a
              href="/olvide-mi-contrasena"
              className="text-sm text-blue-600 hover:text-blue-700 underline transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {/* Quick access */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-3 text-center">Acceso rápido — haz clic para autocompletar (solo desarrollo)</p>
            {quickGroups.map(group => (
              <div key={group.key} className="mb-3 last:mb-0">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{group.title}</p>
                <div className="flex flex-wrap gap-1.5">
                  {quickAccess.filter(u => u.group === group.key).map((user) => (
                    <button
                      key={user.rut}
                      onClick={() => {
                        setRut(user.rut);
                        setPassword(user.password);
                      }}
                      className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-gray-200
                        hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700
                        transition-all duration-200 text-gray-600 whitespace-nowrap"
                    >
                      {user.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Link de diagnóstico */}
        <div className="mt-4 text-center">
          <a
            href="/diagnostico"
            className="text-xs text-blue-300 hover:text-blue-200 underline transition-colors"
          >
            🔧 ¿Problemas al conectar? Ejecutar diagnóstico
          </a>
        </div>
      </div>
    </div>
  );
}

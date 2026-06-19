import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { School, Lock, User, AlertCircle, CheckCircle2, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { resetearContrasena } from '../api/auth';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [rut, setRut] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (newPassword.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const result = await resetearContrasena({
        rut: rut,
        newPassword: newPassword,
      });

      if (result.exito) {
        setSuccess(true);
      } else {
        setError(result.error || 'Error al restablecer la contraseña. Verifica el RUT e intenta de nuevo.');
      }
    } catch (err) {
      const msg = err.response?.data?.error;
      if (msg) {
        setError(msg);
      } else if (err.response?.status === 500) {
        setError('Error interno del servidor. Verifica que todos los servicios estén funcionando.');
      } else {
        setError('Error de conexión. Asegúrate de que los servicios estén funcionando.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-emerald-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Contraseña Restablecida</h2>
            <p className="text-sm text-gray-500 mb-6">
              Tu contraseña ha sido actualizada correctamente. Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
            <button onClick={() => navigate('/login')} className="btn-primary w-full">
              Ir a Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-3 border border-white/20">
            <Lock size={32} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Recuperar Contraseña</h1>
          <p className="text-blue-200 mt-1 text-sm">Colegio Bernardo O'Higgins</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Restablecer Contraseña</h2>
          <p className="text-sm text-gray-500 mb-6">
            Ingresa tu RUT y una nueva contraseña para restablecer el acceso a tu cuenta.
          </p>

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
              <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-10 pr-10"
                  required
                  minLength={4}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-10"
                  required
                  minLength={4}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            <button type="submit" disabled={loading || !rut || !newPassword || !confirmPassword} className="btn-primary w-full py-3 disabled:opacity-50">
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  Restableciendo...
                </div>
              ) : (
                'Restablecer Contraseña'
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1.5 mx-auto"
            >
              <ArrowLeft size={16} />
              Volver a iniciar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

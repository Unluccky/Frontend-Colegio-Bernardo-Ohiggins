import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  UserCircle2, GraduationCap, UserCheck, UserCog, ShieldPlus,
  Mail, School, BookOpen, ArrowLeft, Lock, Eye, EyeOff, Save, Check, AlertCircle, Loader2
} from 'lucide-react';
import { estudiantesApi, profesoresApi, apoderadosApi } from '../../api/endpoints';
import { cambiarContrasena } from '../../api/auth';

const roleConfig = {
  UTP: { label: 'UTP · Unidad Técnico Pedagógica', icon: <UserCog size={24} />, color: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/30' },
  PROFESOR: { label: 'Profesor', icon: <UserCheck size={24} />, color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30' },
  ALUMNO: { label: 'Estudiante', icon: <GraduationCap size={24} />, color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30' },
  APODERADO: { label: 'Apoderado', icon: <UserCircle2 size={24} />, color: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/30' },
};

const getCursoLabel = (nivel) => {
  if (!nivel) return '';
  if (nivel <= 8) return `${nivel}° Básico`;
  return `${nivel - 8}° Medio`;
};

export default function PerfilPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [showPassword, setShowPassword] = useState({ current: false, newPass: false, confirm: false });
  const [passwordSaved, setPasswordSaved] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (user?.role === 'ALUMNO') {
          const res = await estudiantesApi.buscarPorRut(user.rut);
          setProfileData({ ...res.data, type: 'estudiante' });
        } else if (user?.role === 'PROFESOR') {
          const res = await profesoresApi.listar();
          const yo = res.data.find(p => p.rut === user.rut);
          setProfileData({ ...yo, type: 'profesor' });
        } else if (user?.role === 'APODERADO') {
          const res = await apoderadosApi.buscarPorRut(user.rut);
          setProfileData({ ...res.data, type: 'apoderado' });
        } else {
          setProfileData({ rut: user.rut, type: 'utp' });
        }
      } catch (e) {
        console.error(e);
        setProfileData({ rut: user.rut, type: user?.role?.toLowerCase() });
      } finally {
        setLoading(false);
      }
    };
    if (user) loadProfile();
  }, [user]);

  const [saving, setSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handlePasswordChange = async () => {
    setPasswordError('');

    // Validaciones
    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordError('Las contraseñas nuevas no coinciden.');
      return;
    }
    if (passwordForm.newPass.length < 4) {
      setPasswordError('La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }

    setSaving(true);
    try {
      const result = await cambiarContrasena({
        rut: user.rut,
        currentPassword: passwordForm.current,
        newPassword: passwordForm.newPass,
      });

      if (result.exito) {
        setPasswordSaved(true);
        setPasswordForm({ current: '', newPass: '', confirm: '' });
        setTimeout(() => setPasswordSaved(false), 3000);
      } else {
        setPasswordError(result.error || 'Error al cambiar la contraseña.');
      }
    } catch (err) {
      setPasswordError(err.response?.data?.error || 'Error de conexión. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const role = roleConfig[user?.role] || roleConfig.UTP;

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Mi Perfil</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Información personal y configuración de cuenta</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="card">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-blue-700 flex items-center justify-center shrink-0">
            <span className="text-3xl font-bold text-white">
              {user?.rut?.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {profileData?.nombre
                  ? `${profileData.nombre} ${profileData.apellido || ''}`
                  : user?.role
                }
              </h2>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${role.color}`}>
                {role.icon}
                {role.label}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <ShieldPlus size={16} className="text-gray-400" />
                <span className="font-medium">RUT:</span> {user?.rut}
              </div>

              {profileData?.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Mail size={16} className="text-gray-400" />
                  <span className="font-medium">Email:</span> {profileData.email}
                </div>
              )}

              {profileData?.curso && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <School size={16} className="text-gray-400" />
                  <span className="font-medium">Curso:</span> {getCursoLabel(profileData.curso)}
                </div>
              )}

              {profileData?.especialidad && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <BookOpen size={16} className="text-gray-400" />
                  <span className="font-medium">Especialidad:</span> {profileData.especialidad}
                </div>
              )}

              {profileData?.estudiante && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <GraduationCap size={16} className="text-gray-400" />
                  <span className="font-medium">Estudiante:</span> {profileData.estudiante.nombre} {profileData.estudiante.apellido}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Lock size={20} className="text-gray-500" />
          Cambiar Contraseña
        </h3>          {passwordSaved && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-sm text-emerald-600 dark:text-emerald-400 mb-4">
              <Check size={16} />
              Contraseña actualizada correctamente.
            </div>
          )}
          {passwordError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400 mb-4">
              <AlertCircle size={16} />
              {passwordError}
            </div>
          )}

        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña actual</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword.current ? 'text' : 'password'}
                value={passwordForm.current}
                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                className="input-field pl-10 pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword.current ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nueva contraseña</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword.newPass ? 'text' : 'password'}
                value={passwordForm.newPass}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                className="input-field pl-10 pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword({ ...showPassword, newPass: !showPassword.newPass })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword.newPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmar contraseña</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword.confirm ? 'text' : 'password'}
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                className="input-field pl-10 pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            onClick={handlePasswordChange}
            disabled={saving || !passwordForm.current || !passwordForm.newPass || !passwordForm.confirm}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {saving ? 'Guardando...' : 'Actualizar Contraseña'}
          </button>
        </div>
      </div>
    </div>
  );
}

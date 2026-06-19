import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  notasApi, asistenciasApi, mensajesApi, notificacionesApi,
  estudiantesApi, profesoresApi, asignaturasApi, apoderadosApi,
  evaluacionesApi, anotacionesApi
} from '../../api/endpoints';
import {
  GraduationCap, Users, BookOpen, ClipboardList, Calculator,
  CalendarCheck, MessageSquareText, FileBarChart, Clock,
  School, Bell, TrendingUp, CalendarDays, UserCheck,
  ShieldPlus, AlertTriangle, CheckCircle
} from 'lucide-react';
import Skeleton from '../../components/Skeleton';

const roleModules = {
  UTP: [
    { label: 'Usuarios UTP', to: '/utp', icon: <ShieldPlus size={24} />, desc: 'Gestionar usuarios UTP', color: 'from-purple-500 to-purple-600' },
    { label: 'Estudiantes', to: '/estudiantes', icon: <GraduationCap size={24} />, desc: 'Gestionar estudiantes', color: 'from-emerald-500 to-emerald-600' },
    { label: 'Profesores', to: '/profesores', icon: <Users size={24} />, desc: 'Gestionar profesores', color: 'from-blue-500 to-blue-600' },
    { label: 'Apoderados', to: '/apoderados', icon: <UserCheck size={24} />, desc: 'Gestionar apoderados', color: 'from-amber-500 to-amber-600' },
    { label: 'Asignaturas', to: '/asignaturas', icon: <BookOpen size={24} />, desc: 'Administrar asignaturas', color: 'from-purple-500 to-purple-600' },
    { label: 'Evaluaciones', to: '/evaluaciones', icon: <ClipboardList size={24} />, desc: 'Planificar evaluaciones', color: 'from-amber-500 to-amber-600' },
    { label: 'Cursos', to: '/cursos', icon: <School size={24} />, desc: 'Gestionar cursos', color: 'from-cyan-500 to-cyan-600' },
    { label: 'Notificaciones', to: '/notificaciones', icon: <Bell size={24} />, desc: 'Centro de notificaciones', color: 'from-amber-500 to-amber-600' },
    { label: 'Reportes', to: '/reportes', icon: <FileBarChart size={24} />, desc: 'Reportes y estadísticas', color: 'from-rose-500 to-rose-600' },
  ],
  PROFESOR: [
    { label: 'Evaluaciones', to: '/evaluaciones', icon: <ClipboardList size={24} />, desc: 'Mis evaluaciones', color: 'from-amber-500 to-amber-600' },
    { label: 'Notas', to: '/notas', icon: <Calculator size={24} />, desc: 'Registrar notas', color: 'from-green-500 to-green-600' },
    { label: 'Asistencia', to: '/asistencia', icon: <CalendarCheck size={24} />, desc: 'Tomar asistencia', color: 'from-blue-500 to-blue-600' },
    { label: 'Anotaciones', to: '/anotaciones', icon: <MessageSquareText size={24} />, desc: 'Anotaciones de alumnos', color: 'from-orange-500 to-orange-600' },
    { label: 'Horarios', to: '/horarios', icon: <Clock size={24} />, desc: 'Mis horarios', color: 'from-violet-500 to-violet-600' },
    { label: 'Notificaciones', to: '/notificaciones', icon: <Bell size={24} />, desc: 'Centro de notificaciones', color: 'from-amber-500 to-amber-600' },
    { label: 'Reportes', to: '/reportes', icon: <FileBarChart size={24} />, desc: 'Reportes de cursos', color: 'from-rose-500 to-rose-600' },
  ],
  ALUMNO: [
    { label: 'Mis Notas', to: '/mis-notas', icon: <Calculator size={24} />, desc: 'Consulta tus calificaciones', color: 'from-green-500 to-green-600' },
    { label: 'Mi Asistencia', to: '/mi-asistencia', icon: <CalendarCheck size={24} />, desc: 'Registro de asistencia', color: 'from-blue-500 to-blue-600' },
    { label: 'Mis Anotaciones', to: '/mis-anotaciones', icon: <MessageSquareText size={24} />, desc: 'Anotaciones y observaciones', color: 'from-orange-500 to-orange-600' },
    { label: 'Notificaciones', to: '/notificaciones', icon: <Bell size={24} />, desc: 'Centro de notificaciones', color: 'from-amber-500 to-amber-600' },
    { label: 'Horarios', to: '/horarios', icon: <Clock size={24} />, desc: 'Horario de clases', color: 'from-violet-500 to-violet-600' },
    { label: 'Calendario', to: '/calendario', icon: <CalendarDays size={24} />, desc: 'Calendario escolar', color: 'from-pink-500 to-pink-600' },
    { label: 'Mensajes', to: '/mensajes', icon: <Bell size={24} />, desc: 'Bandeja de mensajes', color: 'from-cyan-500 to-cyan-600' },
  ],
  APODERADO: [
    { label: 'Notas', to: '/mis-notas', icon: <Calculator size={24} />, desc: 'Notas de tu pupilo', color: 'from-green-500 to-green-600' },
    { label: 'Asistencia', to: '/mi-asistencia', icon: <CalendarCheck size={24} />, desc: 'Asistencia', color: 'from-blue-500 to-blue-600' },
    { label: 'Anotaciones', to: '/mis-anotaciones', icon: <MessageSquareText size={24} />, desc: 'Anotaciones', color: 'from-orange-500 to-orange-600' },
    { label: 'Notificaciones', to: '/notificaciones', icon: <Bell size={24} />, desc: 'Centro de notificaciones', color: 'from-amber-500 to-amber-600' },
    { label: 'Calendario', to: '/calendario', icon: <CalendarDays size={24} />, desc: 'Calendario escolar', color: 'from-pink-500 to-pink-600' },
    { label: 'Mensajes', to: '/mensajes', icon: <Bell size={24} />, desc: 'Contactar al colegio', color: 'from-cyan-500 to-cyan-600' },
  ],
};

function StatCard({ value, label, icon, bgColor, iconColor, progress }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg ${bgColor} flex items-center justify-center shrink-0`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-bold text-gray-800 truncate">{value}</p>
        <p className="text-xs text-gray-500 truncate">{label}</p>
        {progress !== undefined && (
          <div className="mt-1.5 w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(progress, 100)}%`,
                backgroundColor: progress >= 70 ? '#10b981' : progress >= 40 ? '#f59e0b' : '#ef4444'
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function formatPorcentaje(parte, total) {
  if (!total) return '—';
  return Math.round((parte / total) * 100) + '%';
}

export default function DashboardHome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [notasRes, asistenciasRes, mensajesRes, notificacionesRes,
               estudiantesRes, profesoresRes, asignaturasRes, apoderadosRes, evaluacionesRes] =
          await Promise.allSettled([
            notasApi.listar(),
            asistenciasApi.listar(),
            mensajesApi.listar(),
            notificacionesApi.listar(),
            estudiantesApi.listar(),
            profesoresApi.listar(),
            asignaturasApi.listar(),
            apoderadosApi.listar(),
            evaluacionesApi.listar(),
          ]);

        const notas = notasRes.status === 'fulfilled' ? notasRes.value.data : [];
        const asistencias = asistenciasRes.status === 'fulfilled' ? asistenciasRes.value.data : [];
        const mensajes = mensajesRes.status === 'fulfilled' ? mensajesRes.value.data : [];
        const notificaciones = notificacionesRes.status === 'fulfilled' ? notificacionesRes.value.data : [];
        const estudiantes = estudiantesRes.status === 'fulfilled' ? estudiantesRes.value.data : [];
        const profesores = profesoresRes.status === 'fulfilled' ? profesoresRes.value.data : [];
        const asignaturas = asignaturasRes.status === 'fulfilled' ? asignaturasRes.value.data : [];
        const apoderados = apoderadosRes.status === 'fulfilled' ? apoderadosRes.value.data : [];
        const evaluaciones = evaluacionesRes.status === 'fulfilled' ? evaluacionesRes.value.data : [];

        const role = user?.role;

        // ── Helper: obtener IDs de asignaturas del profesor ──
        const getProfesorAsignaturaIds = () => {
          if (role !== 'PROFESOR') return [];
          const profe = profesores.find(p => p.rut === user.rut);
          if (!profe) return [];
          return asignaturas.filter(a => a.profesor?.id === profe.id).map(a => a.id);
        };

        // ── Helper: obtener estudianteId según rol ──
        const getEstudianteId = async () => {
          if (role === 'ALUMNO') {
            const yo = estudiantes.find(e => e.rut === user.rut);
            return yo?.id || null;
          }
          if (role === 'APODERADO') {
            try {
              const apoRes = await apoderadosApi.buscarPorRut(user.rut);
              return apoRes.data?.estudiante?.id || null;
            } catch { return null; }
          }
          return null;
        };

        const estudianteId = await getEstudianteId();
        const profeAsignaturaIds = getProfesorAsignaturaIds();

        // ── Construir stats según rol ─────────────────────
        let nuevasStats = [];

        if (role === 'UTP') {
          // Total estudiantes
          nuevasStats.push({
            value: estudiantes.length || '—',
            label: 'Estudiantes',
            icon: <GraduationCap size={22} />,
            bgColor: 'bg-emerald-100',
            iconColor: 'text-emerald-600',
          });
          // Total profesores
          nuevasStats.push({
            value: profesores.length || '—',
            label: 'Profesores',
            icon: <Users size={22} />,
            bgColor: 'bg-blue-100',
            iconColor: 'text-blue-600',
          });
          // Total apoderados
          nuevasStats.push({
            value: apoderados.length || '—',
            label: 'Apoderados',
            icon: <UserCheck size={22} />,
            bgColor: 'bg-amber-100',
            iconColor: 'text-amber-600',
          });
          // Total asignaturas
          nuevasStats.push({
            value: asignaturas.length || '—',
            label: 'Asignaturas',
            icon: <BookOpen size={22} />,
            bgColor: 'bg-purple-100',
            iconColor: 'text-purple-600',
          });
          // Asistencia general
          const totalAsis = asistencias.length;
          const presentes = asistencias.filter(a => a.estado === 'PRESENTE').length;
          nuevasStats.push({
            value: formatPorcentaje(presentes, totalAsis),
            label: 'Asistencia General',
            icon: <CalendarCheck size={22} />,
            bgColor: 'bg-blue-100',
            iconColor: 'text-blue-600',
            progress: totalAsis > 0 ? (presentes / totalAsis) * 100 : 0,
          });
          // Evaluaciones creadas
          nuevasStats.push({
            value: evaluaciones.length || '—',
            label: 'Evaluaciones Creadas',
            icon: <ClipboardList size={22} />,
            bgColor: 'bg-amber-100',
            iconColor: 'text-amber-600',
          });
          // Promedio general de notas
          const totalNotas = notas.length;
          const sumaNotas = notas.reduce((s, n) => s + (n.valor || 0), 0);
          const promedioGeneral = totalNotas > 0 ? (sumaNotas / totalNotas).toFixed(1) : '—';
          nuevasStats.push({
            value: promedioGeneral,
            label: 'Promedio General Notas',
            icon: <Calculator size={22} />,
            bgColor: 'bg-emerald-100',
            iconColor: 'text-emerald-600',
          });

        } else if (role === 'PROFESOR') {
          const profe = profesores.find(p => p.rut === user.rut);
          const misAsignaturas = profe
            ? asignaturas.filter(a => a.profesor?.id === profe.id)
            : [];
          const misCursos = [...new Set(misAsignaturas.map(a => a.nivelCurso).filter(Boolean))].sort((a, b) => a - b);
          const misAsignaturaIds = misAsignaturas.map(a => a.id);

          // Estudiantes totales en mis cursos
          const estudiantesEnMisCursos = estudiantes.filter(e => misCursos.includes(e.curso)).length;

          // Mis evaluaciones
          const misEvaluaciones = profeAsignaturaIds.length > 0
            ? evaluaciones.filter(e => profeAsignaturaIds.includes(e.asignatura?.id))
            : [];

          // Cursos que enseña
          nuevasStats.push({
            value: misCursos.length || '—',
            label: `Cursos: ${misCursos.map(c => c <= 8 ? `${c}°B` : `${c - 8}°M`).join(', ') || '—'}`,
            icon: <School size={22} />,
            bgColor: 'bg-cyan-100',
            iconColor: 'text-cyan-600',
          });
          // Asignaturas a cargo
          nuevasStats.push({
            value: misAsignaturas.length || '—',
            label: 'Asignaturas a cargo',
            icon: <BookOpen size={22} />,
            bgColor: 'bg-purple-100',
            iconColor: 'text-purple-600',
          });
          // Estudiantes en sus cursos
          nuevasStats.push({
            value: estudiantesEnMisCursos || '—',
            label: 'Estudiantes en mis cursos',
            icon: <GraduationCap size={22} />,
            bgColor: 'bg-emerald-100',
            iconColor: 'text-emerald-600',
          });
          // Evaluaciones creadas
          nuevasStats.push({
            value: misEvaluaciones.length || '—',
            label: 'Mis Evaluaciones',
            icon: <ClipboardList size={22} />,
            bgColor: 'bg-amber-100',
            iconColor: 'text-amber-600',
          });
          // Asistencia general
          const totalAsis = asistencias.length;
          const presentes = asistencias.filter(a => a.estado === 'PRESENTE').length;
          nuevasStats.push({
            value: formatPorcentaje(presentes, totalAsis),
            label: 'Asistencia General',
            icon: <CalendarCheck size={22} />,
            bgColor: 'bg-blue-100',
            iconColor: 'text-blue-600',
            progress: totalAsis > 0 ? (presentes / totalAsis) * 100 : 0,
          });
          // Notificaciones
          nuevasStats.push({
            value: notificaciones.length || '—',
            label: 'Notificaciones',
            icon: <Bell size={22} />,
            bgColor: 'bg-amber-100',
            iconColor: 'text-amber-600',
          });

        } else if (role === 'ALUMNO' || role === 'APODERADO') {
          const esApoderado = role === 'APODERADO';

          // Mis notas / del pupilo
          const misNotas = estudianteId
            ? notas.filter(n => (n.estudiante?.id || n.estudiante) === estudianteId)
            : [];
          const promedio = misNotas.length > 0
            ? (misNotas.reduce((s, n) => s + n.valor, 0) / misNotas.length).toFixed(1)
            : '—';

          // Mi asistencia / del pupilo
          const misAsistencias = estudianteId
            ? asistencias.filter(a => a.estudianteId === estudianteId)
            : [];
          const totalAsis = misAsistencias.length;
          const presentes = misAsistencias.filter(a => a.estado === 'PRESENTE').length;

          // Anotaciones del estudiante
          let anotacionesAlumno = [];
          try {
            const anotRes = await anotacionesApi.buscarPorEstudiante(estudianteId);
            anotacionesAlumno = anotRes.data || [];
          } catch { /* ignore */ }

          // Promedio
          nuevasStats.push({
            value: promedio,
            label: esApoderado ? 'Promedio del Pupilo' : 'Promedio General',
            icon: <TrendingUp size={22} />,
            bgColor: 'bg-emerald-100',
            iconColor: 'text-emerald-600',
          });
          // Asistencia
          nuevasStats.push({
            value: formatPorcentaje(presentes, totalAsis) || '—',
            label: 'Asistencia',
            icon: <CalendarCheck size={22} />,
            bgColor: 'bg-blue-100',
            iconColor: 'text-blue-600',
            progress: totalAsis > 0 ? (presentes / totalAsis) * 100 : 0,
          });
          // Anotaciones
          nuevasStats.push({
            value: anotacionesAlumno.length || '—',
            label: 'Anotaciones',
            icon: <MessageSquareText size={22} />,
            bgColor: 'bg-orange-100',
            iconColor: 'text-orange-600',
          });
          // Anotaciones negativas
          const negativas = anotacionesAlumno.filter(a => a.tipo === 'NEGATIVA').length;
          nuevasStats.push({
            value: negativas || '0',
            label: 'Anotaciones Negativas',
            icon: <AlertTriangle size={22} />,
            bgColor: 'bg-red-100',
            iconColor: 'text-red-500',
          });
          // Notificaciones
          nuevasStats.push({
            value: notificaciones.length || '—',
            label: 'Notificaciones',
            icon: <Bell size={22} />,
            bgColor: 'bg-amber-100',
            iconColor: 'text-amber-600',
          });
          // Mensajes
          nuevasStats.push({
            value: mensajes.length || '—',
            label: 'Mensajes',
            icon: <MessageSquareText size={22} />,
            bgColor: 'bg-purple-100',
            iconColor: 'text-purple-600',
          });
        }

        setStats(nuevasStats);
      } catch (e) {
        console.error('Error cargando estadísticas del dashboard:', e);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [user?.rut, user?.role]);

  const modules = user ? roleModules[user.role] || [] : [];

  if (loading) return <Skeleton.Dashboard />;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="card bg-gradient-to-r from-blue-700 to-blue-600 text-white border-0">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
            <span className="text-2xl font-bold">{user?.rut?.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">¡Bienvenido!</h1>
            <p className="text-blue-100 mt-1">
              {user?.role === 'UTP' && 'Panel de Gestión — Unidad Técnico Pedagógica'}
              {user?.role === 'PROFESOR' && 'Panel del Profesor'}
              {user?.role === 'ALUMNO' && 'Panel del Estudiante'}
              {user?.role === 'APODERADO' && 'Panel del Apoderado'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick stats - responsive grid */}
      {stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>
      )}

      {/* Module cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((mod) => (
          <button
            key={mod.to}
            onClick={() => navigate(mod.to)}
            className="card text-left hover:shadow-lg hover:scale-[1.02] transition-all duration-200 group"
          >
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${mod.color} flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform duration-200`}>
              {mod.icon}
            </div>
            <h3 className="font-semibold text-gray-800">{mod.label}</h3>
            <p className="text-xs text-gray-500 mt-1">{mod.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

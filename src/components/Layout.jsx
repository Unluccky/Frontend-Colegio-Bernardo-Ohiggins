import { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from '../context/AuthContext';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, ClipboardList,
  Calculator, CalendarCheck, MessageSquareText, Bell, FileBarChart,
  CalendarDays, Clock, Menu, X, LogOut, ChevronDown, School,
  UserCircle2, UserCheck, UserCog, ShieldPlus, Sun, Moon
} from 'lucide-react';
import { mensajesApi, notificacionesApi } from '../api/endpoints';

// ── Dark Mode Context ────────────────────────────────────────
const DarkModeContext = createContext(null);

export function DarkModeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) return stored === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', dark);
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const toggle = () => setDark(prev => !prev);

  return (
    <DarkModeContext.Provider value={{ dark, toggle }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  return useContext(DarkModeContext);
}

const roleConfig = {
  UTP: { label: 'UTP · Unidad Técnico Pedagógica', icon: <UserCog size={18} />, color: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/30' },
  PROFESOR: { label: 'Profesor', icon: <UserCheck size={18} />, color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30' },
  ALUMNO: { label: 'Estudiante', icon: <GraduationCap size={18} />, color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30' },
  APODERADO: { label: 'Apoderado', icon: <UserCircle2 size={18} />, color: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/30' },
};

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: <LayoutDashboard size={18} />, roles: ['UTP', 'PROFESOR', 'ALUMNO', 'APODERADO'] },
  // UTP
  { label: 'Usuarios UTP', to: '/utp', icon: <ShieldPlus size={18} />, roles: ['UTP'] },
  { label: 'Estudiantes', to: '/estudiantes', icon: <GraduationCap size={18} />, roles: ['UTP'] },
  { label: 'Profesores', to: '/profesores', icon: <Users size={18} />, roles: ['UTP'] },
  { label: 'Apoderados', to: '/apoderados', icon: <UserCircle2 size={18} />, roles: ['UTP'] },
  { label: 'Asignaturas', to: '/asignaturas', icon: <BookOpen size={18} />, roles: ['UTP'] },
  { label: 'Evaluaciones', to: '/evaluaciones', icon: <ClipboardList size={18} />, roles: ['UTP', 'PROFESOR'] },
  { label: 'Cursos', to: '/cursos', icon: <School size={18} />, roles: ['UTP'] },
  // Profesor
  { label: 'Notas', to: '/notas', icon: <Calculator size={18} />, roles: ['UTP', 'PROFESOR'] },
  { label: 'Asistencia', to: '/asistencia', icon: <CalendarCheck size={18} />, roles: ['UTP', 'PROFESOR'] },
  { label: 'Anotaciones', to: '/anotaciones', icon: <MessageSquareText size={18} />, roles: ['UTP', 'PROFESOR'] },
  // Estudiante / Apoderado
  { label: 'Mis Notas', to: '/mis-notas', icon: <Calculator size={18} />, roles: ['ALUMNO', 'APODERADO'] },
  { label: 'Mi Asistencia', to: '/mi-asistencia', icon: <CalendarCheck size={18} />, roles: ['ALUMNO', 'APODERADO'] },
  { label: 'Mis Anotaciones', to: '/mis-anotaciones', icon: <MessageSquareText size={18} />, roles: ['ALUMNO', 'APODERADO'] },
  // Generales
  { label: 'Horarios', to: '/horarios', icon: <Clock size={18} />, roles: ['UTP', 'PROFESOR', 'ALUMNO'] },
  { label: 'Calendario', to: '/calendario', icon: <CalendarDays size={18} />, roles: ['UTP', 'PROFESOR', 'ALUMNO', 'APODERADO'] },
  { label: 'Notificaciones', to: '/notificaciones', icon: <Bell size={18} />, roles: ['UTP', 'PROFESOR', 'ALUMNO', 'APODERADO'], badgeKey: 'notificaciones' },
  { label: 'Mensajes', to: '/mensajes', icon: <MessageSquareText size={18} />, roles: ['UTP', 'PROFESOR', 'ALUMNO', 'APODERADO'], badgeKey: 'mensajes' },
  { label: 'Reportes', to: '/reportes', icon: <FileBarChart size={18} />, roles: ['UTP', 'PROFESOR'] },
];

export default function Layout() {
  const { user, logout, hasRole } = useAuth();
  const { dark, toggle: toggleDark } = useDarkMode();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [badges, setBadges] = useState({ mensajes: 0, notificaciones: 0 });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ── Poll for unread counts every 30s ──────────────────────
  useEffect(() => {
    let mounted = true;
    const fetchBadges = async () => {
      try {
        const [mensajesRes, notificacionesRes] = await Promise.allSettled([
          mensajesApi.listar(),
          notificacionesApi.listar(),
        ]);
        if (!mounted) return;
        const mensajes = mensajesRes.status === 'fulfilled' ? mensajesRes.value.data : [];
        const notificaciones = notificacionesRes.status === 'fulfilled' ? notificacionesRes.value.data : [];
        setBadges({
          mensajes: mensajes.filter(m => !m.leido).length,
          notificaciones: notificaciones.filter(n => !n.leida).length,
        });
      } catch { /* ignore */ }
    };
    fetchBadges();
    const interval = setInterval(fetchBadges, 30000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  const roleInfo = user ? roleConfig[user.role] : null;
  const filteredNavItems = navItems.filter(item =>
    item.roles.some(role => hasRole(role))
  );

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        transform transition-transform duration-200 ease-in-out
        lg:translate-x-0 lg:static lg:inset-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 px-5 h-16 border-b border-gray-200 dark:border-gray-700 bg-blue-700">
            <School size={28} className="text-white" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white leading-tight">Colegio Bernardo</span>
              <span className="text-[10px] text-blue-200 leading-tight">O'Higgins</span>
            </div>
          </div>

          {/* Nav items */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                className={({ isActive }) =>
                  isActive ? 'sidebar-link-active dark:sidebar-link-active-dark' : 'sidebar-link-inactive dark:sidebar-link-inactive-dark'
                }
                onClick={() => setSidebarOpen(false)}
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {/* Badge */}
                {item.badgeKey && badges[item.badgeKey] > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold text-white bg-red-500 rounded-full animate-pulse">
                    {badges[item.badgeKey] > 99 ? '99+' : badges[item.badgeKey]}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User info + dark mode toggle */}
          {user && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${roleInfo?.color}`}>
                {roleInfo?.icon}
                {roleInfo?.label}
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">RUT: {user.rut}</div>
                <button
                  onClick={toggleDark}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title={dark ? 'Modo claro' : 'Modo oscuro'}
                >
                  {dark
                    ? <Sun size={16} className="text-yellow-400" />
                    : <Moon size={16} className="text-gray-500" />
                  }
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="flex-1" />

            <div className="flex items-center gap-2">
              {/* Dark mode toggle in top bar */}
              <button
                onClick={toggleDark}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={dark ? 'Modo claro' : 'Modo oscuro'}
              >
                {dark
                  ? <Sun size={18} className="text-yellow-400" />
                  : <Moon size={18} className="text-gray-500" />
                }
              </button>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user?.rut?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
                    {user?.rut}
                  </span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                      <button
                        onClick={() => { setUserMenuOpen(false); navigate('/perfil'); }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <UserCircle2 size={16} />
                        Mi Perfil
                      </button>
                      <hr className="my-1 border-gray-100 dark:border-gray-700" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut size={16} />
                        Cerrar sesión
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import DashboardHome from './pages/dashboard/DashboardHome';
import EstudianteList from './pages/estudiantes/EstudianteList';
import ProfesorList from './pages/profesores/ProfesorList';
import ApoderadoList from './pages/apoderados/ApoderadoList';
import AsignaturaList from './pages/asignaturas/AsignaturaList';
import EvaluacionList from './pages/evaluaciones/EvaluacionList';
import NotasList from './pages/notas/NotasList';
import AsistenciaList from './pages/asistencia/AsistenciaList';
import AnotacionList from './pages/anotaciones/AnotacionList';
import CursosPage from './pages/cursos/CursosPage';
import HorariosPage from './pages/horarios/HorariosPage';
import CalendarioPage from './pages/calendario/CalendarioPage';
import ReportesPage from './pages/reportes/ReportesPage';
import MensajesPage from './pages/mensajes/MensajesPage';
import MisNotasPage from './pages/mis-notas/MisNotasPage';
import MiAsistenciaPage from './pages/mi-asistencia/MiAsistenciaPage';
import MisAnotacionesPage from './pages/mis-anotaciones/MisAnotacionesPage';
import UtpUserList from './pages/utp/UtpUserList';
import NotificacionesPage from './pages/notificaciones/NotificacionesPage';
import PerfilPage from './pages/perfil/PerfilPage';
import Diagnostico from './pages/Diagnostico';
import ForgotPassword from './pages/ForgotPassword';

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
      } />
      <Route path="/olvide-mi-contrasena" element={<ForgotPassword />} />

      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardHome />} />

        {/* UTP (Unidad Técnico Pedagógica) */}
        <Route path="utp" element={<ProtectedRoute roles={['UTP']}><UtpUserList /></ProtectedRoute>} />
        <Route path="estudiantes" element={<ProtectedRoute roles={['UTP']}><EstudianteList /></ProtectedRoute>} />
        <Route path="profesores" element={<ProtectedRoute roles={['UTP']}><ProfesorList /></ProtectedRoute>} />
        <Route path="apoderados" element={<ProtectedRoute roles={['UTP']}><ApoderadoList /></ProtectedRoute>} />
        <Route path="asignaturas" element={<ProtectedRoute roles={['UTP']}><AsignaturaList /></ProtectedRoute>} />
        <Route path="evaluaciones" element={<ProtectedRoute roles={['UTP', 'PROFESOR']}><EvaluacionList /></ProtectedRoute>} />
        <Route path="cursos" element={<ProtectedRoute roles={['UTP']}><CursosPage /></ProtectedRoute>} />

        {/* Profesor */}
        <Route path="notas" element={<ProtectedRoute roles={['UTP', 'PROFESOR']}><NotasList /></ProtectedRoute>} />
        <Route path="asistencia" element={<ProtectedRoute roles={['UTP', 'PROFESOR']}><AsistenciaList /></ProtectedRoute>} />
        <Route path="anotaciones" element={<ProtectedRoute roles={['UTP', 'PROFESOR']}><AnotacionList /></ProtectedRoute>} />

        {/* Estudiante/Apoderado */}
        <Route path="mis-notas" element={<ProtectedRoute roles={['ALUMNO', 'APODERADO']}><MisNotasPage /></ProtectedRoute>} />
        <Route path="mi-asistencia" element={<ProtectedRoute roles={['ALUMNO', 'APODERADO']}><MiAsistenciaPage /></ProtectedRoute>} />
        <Route path="mis-anotaciones" element={<ProtectedRoute roles={['ALUMNO', 'APODERADO']}><MisAnotacionesPage /></ProtectedRoute>} />

        {/* Generales */}
        <Route path="horarios" element={<ProtectedRoute roles={['UTP', 'PROFESOR', 'ALUMNO']}><HorariosPage /></ProtectedRoute>} />
        <Route path="calendario" element={<ProtectedRoute roles={['UTP', 'PROFESOR', 'ALUMNO', 'APODERADO']}><CalendarioPage /></ProtectedRoute>} />
        <Route path="mensajes" element={<ProtectedRoute roles={['UTP', 'PROFESOR', 'ALUMNO', 'APODERADO']}><MensajesPage /></ProtectedRoute>} />
        <Route path="reportes" element={<ProtectedRoute roles={['UTP', 'PROFESOR']}><ReportesPage /></ProtectedRoute>} />
        <Route path="notificaciones" element={<ProtectedRoute roles={['UTP', 'PROFESOR', 'ALUMNO', 'APODERADO']}><NotificacionesPage /></ProtectedRoute>} />
        <Route path="perfil" element={<ProtectedRoute><PerfilPage /></ProtectedRoute>} />
      </Route>

      <Route path="/diagnostico" element={<Diagnostico />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

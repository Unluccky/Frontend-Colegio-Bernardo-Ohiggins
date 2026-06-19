import { useState, useEffect } from 'react';
import { asistenciasApi, estudiantesApi, asignaturasApi, apoderadosApi } from '../../api/endpoints';
import { CalendarCheck, GraduationCap, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { parseLocalDate, formatLocalDate } from '../../utils/dateUtils';

const estadoColors = {
  PRESENTE: 'badge-success',
  AUSENTE: 'badge-danger',
  ATRASADO: 'badge-warning',
  JUSTIFICADO: 'badge-info'
};

export default function MiAsistenciaPage() {
  const { user } = useAuth();
  const [asistencias, setAsistencias] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Resolver el ID del estudiante según el rol
        let estudianteId = null;
        let estudianteData = null;

        if (user?.role === 'APODERADO') {
          // Apoderado: buscar por RUT y obtener el estudiante vinculado
          const apRes = await apoderadosApi.buscarPorRut(user.rut);
          const apoderado = apRes.data;
          if (apoderado?.estudiante?.id) {
            estudianteId = apoderado.estudiante.id;
            estudianteData = apoderado.estudiante;
          }
        } else {
          // Alumno: buscar estudiante por RUT
          const eRes = await estudiantesApi.listar();
          const found = eRes.data.find(e => e.rut === user?.rut);
          if (found) {
            estudianteId = found.id;
            estudianteData = found;
          }
        }

        if (estudianteId) {
          setStudent(estudianteData);

          // 2. Cargar datos usando endpoints filtrados por estudiante
          const [aRes, asigRes] = await Promise.all([
            asistenciasApi.buscarPorEstudiante(estudianteId),
            asignaturasApi.listar()
          ]);
          setAsistencias(aRes.data);
          setAsignaturas(asigRes.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user?.rut, user?.role]);

  const misAsistencias = asistencias;

  const total = misAsistencias.length;
  const presentes = misAsistencias.filter(a => a.estado === 'PRESENTE').length;
  const ausentes = misAsistencias.filter(a => a.estado === 'AUSENTE').length;
  const atrasados = misAsistencias.filter(a => a.estado === 'ATRASADO').length;
  const justificados = misAsistencias.filter(a => a.estado === 'JUSTIFICADO').length;
  const porcentaje = total > 0 ? Math.round((presentes / total) * 100) : 0;

  const getAsignaturaName = (id) => asignaturas.find(a => a.id === id)?.nombre || `ID: ${id}`;

  if (loading) return (
    <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Mi Asistencia</h1>
        <p className="text-sm text-gray-500 mt-1">{student ? `${student.nombre} ${student.apellido}` : 'Cargando...'}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="card text-center">
          <p className="text-2xl font-bold text-gray-800">{porcentaje}%</p>
          <p className="text-xs text-gray-500">Asistencia</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-emerald-600">{presentes}</p>
          <p className="text-xs text-gray-500">Presentes</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-red-600">{ausentes}</p>
          <p className="text-xs text-gray-500">Ausentes</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-amber-600">{atrasados}</p>
          <p className="text-xs text-gray-500">Atrasados</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-blue-600">{justificados}</p>
          <p className="text-xs text-gray-500">Justificados</p>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Fecha</th>
                <th className="table-header">Asignatura</th>
                <th className="table-header">Estado</th>
              </tr>
            </thead>
            <tbody>
              {misAsistencias.sort((a, b) => parseLocalDate(b.fecha).getTime() - parseLocalDate(a.fecha).getTime()).map(a => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium">{formatLocalDate(a.fecha, 'es-CL')}</td>
                  <td className="table-cell">
                    <span className="flex items-center gap-1.5"><BookOpen size={14} className="text-gray-400" />{getAsignaturaName(a.asignaturaId)}</span>
                  </td>
                  <td className="table-cell"><span className={estadoColors[a.estado]}>{a.estado}</span></td>
                </tr>
              ))}
              {misAsistencias.length === 0 && (
                <tr><td colSpan={3} className="text-center py-12 text-gray-400"><CalendarCheck size={48} className="mx-auto mb-3 text-gray-200" />Sin registros</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

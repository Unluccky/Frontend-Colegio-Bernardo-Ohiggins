import { useState, useEffect } from 'react';
import { anotacionesApi, estudiantesApi, apoderadosApi } from '../../api/endpoints';
import { MessageSquareText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { parseLocalDate, formatLocalDate } from '../../utils/dateUtils';

const tipoColors = {
  POSITIVA: 'badge-success',
  NEGATIVA: 'badge-danger',
  NEUTRAL: 'badge-neutral'
};

const tipoIcons = {
  POSITIVA: '⭐',
  NEGATIVA: '⚠️',
  NEUTRAL: '📝'
};

export default function MisAnotacionesPage() {
  const { user } = useAuth();
  const [anotaciones, setAnotaciones] = useState([]);
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
          const aRes = await anotacionesApi.buscarPorEstudiante(estudianteId);
          setAnotaciones(aRes.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user?.rut, user?.role]);

  const misAnotaciones = anotaciones;

  if (loading) return (
    <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Mis Anotaciones</h1>
        <p className="text-sm text-gray-500 mt-1">{student ? `${student.nombre} ${student.apellido}` : 'Cargando...'}</p>
      </div>

      <div className="card">
        <div className="space-y-3">
          {misAnotaciones.sort((a, b) => parseLocalDate(b.fecha).getTime() - parseLocalDate(a.fecha).getTime()).map(a => (
            <div key={a.id} className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{tipoIcons[a.tipo]}</span>
                  <span className={tipoColors[a.tipo]}>{a.tipo}</span>
                  {a.profesorId && <span className="text-xs text-gray-400">Prof. ID: {a.profesorId}</span>}
                </div>
                <span className="text-xs text-gray-400">{formatLocalDate(a.fecha, 'es-CL')}</span>
              </div>
              <p className="text-sm text-gray-700 ml-8">{a.descripcion}</p>
            </div>
          ))}
          {misAnotaciones.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <MessageSquareText size={48} className="mx-auto mb-3 text-gray-200" />
              <p>No tienes anotaciones registradas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

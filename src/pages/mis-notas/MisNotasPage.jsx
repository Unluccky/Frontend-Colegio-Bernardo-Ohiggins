import { useState, useEffect } from 'react';
import { notasApi, estudiantesApi, evaluacionesApi, asignaturasApi, apoderadosApi } from '../../api/endpoints';
import { Calculator, TrendingUp, BookOpen, ClipboardList } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function MisNotasPage() {
  const { user } = useAuth();
  const [notas, setNotas] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentEstudiante, setStudentEstudiante] = useState(null);

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
          setStudentEstudiante(estudianteData);

          // 2. Cargar datos usando endpoints filtrados por estudiante
          const [nRes, eRes, aRes] = await Promise.all([
            notasApi.buscarPorEstudiante(estudianteId),
            evaluacionesApi.listar(),
            asignaturasApi.listar()
          ]);
          setNotas(nRes.data);
          setEvaluaciones(eRes.data);
          setAsignaturas(aRes.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user?.rut, user?.role]);

  const misNotas = notas;

  const getEval = (id) => evaluaciones.find(e => e.id === id);
  const getAsignatura = (id) => asignaturas.find(a => a.id === id);

  const grouped = misNotas.reduce((acc, nota) => {
    const evalItem = getEval(nota.evaluacion?.id || nota.evaluacion);
    const asigId = evalItem?.asignatura?.id;
    const asig = getAsignatura(asigId);
    const existing = acc.find(a => a.asignaturaId === asigId);
    if (existing) {
      existing.notas.push(nota);
      existing.promedio = Number((existing.notas.reduce((s, n) => s + n.valor, 0) / existing.notas.length).toFixed(1));
    } else {
      acc.push({
        asignaturaId: asigId,
        asignaturaNombre: asig?.nombre || 'Desconocida',
        notas: [nota],
        promedio: nota.valor
      });
    }
    return acc;
  }, []);

  const promedioGeneral = misNotas.length > 0
    ? Number((misNotas.reduce((s, n) => s + n.valor, 0) / misNotas.length).toFixed(1))
    : 0;

  if (loading) return (
    <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Mis Notas</h1>
        <p className="text-sm text-gray-500 mt-1">
          {studentEstudiante ? `${studentEstudiante.nombre} ${studentEstudiante.apellido}` : 'Cargando...'}
        </p>
      </div>

      <div className="card bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0">
        <div className="flex items-center gap-3">
          <TrendingUp size={32} />
          <div>
            <p className="text-sm text-green-100">Promedio General</p>
            <p className="text-4xl font-bold">{promedioGeneral.toFixed(1)}</p>
          </div>
        </div>
      </div>

      {grouped.map((g) => (
        <div key={g.asignaturaId} className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <BookOpen size={18} className="text-blue-600" />
              {g.asignaturaNombre}
            </h3>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
              g.promedio >= 4.0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            }`}>
              Prom: {g.promedio.toFixed(1)}
            </span>
          </div>
          <div className="space-y-2">
            {g.notas.map((nota) => {
              const evalItem = getEval(nota.evaluacion?.id || nota.evaluacion);
              return (
                <div key={nota.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <ClipboardList size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-700">{evalItem?.nombre || '—'}</span>
                    <span className="text-xs text-gray-400">{evalItem?.tipo}</span>
                  </div>
                  <span className={`text-sm font-bold ${
                    nota.valor >= 4.0 ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {nota.valor.toFixed(1)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {misNotas.length === 0 && (
        <div className="card text-center py-12 text-gray-400">
          <Calculator size={48} className="mx-auto mb-3 text-gray-200" />
          <p>No tienes notas registradas</p>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { asistenciasApi, estudiantesApi, asignaturasApi, profesoresApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { CalendarCheck, GraduationCap, BookOpen, Save, Search, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getLocalDateString, formatLocalDate, parseLocalDate } from '../../utils/dateUtils';

const ESTADOS = ['PRESENTE', 'AUSENTE', 'ATRASADO', 'JUSTIFICADO'];

const estadoColors = {
  PRESENTE: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  AUSENTE: 'bg-red-100 text-red-700 border-red-300',
  ATRASADO: 'bg-orange-100 text-orange-700 border-orange-300',
  JUSTIFICADO: 'bg-amber-100 text-amber-700 border-amber-300',
};

const estadoLabels = {
  PRESENTE: 'Presente',
  AUSENTE: 'Ausente',
  ATRASADO: 'Atrasado',
  JUSTIFICADO: 'Justificado',
};

const CURSO_OPTIONS = [
  { value: 1, label: '1° Básico' },
  { value: 2, label: '2° Básico' },
  { value: 3, label: '3° Básico' },
  { value: 4, label: '4° Básico' },
  { value: 5, label: '5° Básico' },
  { value: 6, label: '6° Básico' },
  { value: 7, label: '7° Básico' },
  { value: 8, label: '8° Básico' },
  { value: 9, label: '1° Medio' },
  { value: 10, label: '2° Medio' },
  { value: 11, label: '3° Medio' },
  { value: 12, label: '4° Medio' },
];

export default function AsistenciaList() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selección de clase
  const [selectedCurso, setSelectedCurso] = useState('');
  const [selectedAsignatura, setSelectedAsignatura] = useState('');
  const [selectedFecha, setSelectedFecha] = useState(getLocalDateString());

  // Lista de asistencia
  const [asistenciaList, setAsistenciaList] = useState([]);
  const [classLoaded, setClassLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [cursoAsignaturas, setCursoAsignaturas] = useState([]);

  // Cursos disponibles según rol
  const [availableCursos, setAvailableCursos] = useState([]);

  const load = useCallback(async () => {
    try {
      const [estRes, asigRes, profRes] = await Promise.all([
        estudiantesApi.listar(),
        asignaturasApi.listar(),
        profesoresApi.listar(),
      ]);
      setStudents(estRes.data);
      setAsignaturas(asigRes.data);
      setProfesores(profRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Determinar cursos disponibles según el rol
  useEffect(() => {
    if (!asignaturas.length || !profesores.length) return;

    if (user?.role === 'PROFESOR') {
      const profe = profesores.find(p => p.rut === user.rut);
      if (profe) {
        const misCursos = [...new Set(
          asignaturas
            .filter(a => a.profesor?.id === profe.id)
            .map(a => a.nivelCurso)
            .filter(Boolean)
        )].sort((a, b) => a - b);
        setAvailableCursos(misCursos);
      }
    } else {
      // UTP: todos los cursos
      setAvailableCursos(Array.from({ length: 12 }, (_, i) => i + 1));
    }
  }, [asignaturas, profesores, user]);

  // Filtrar asignaturas por curso seleccionado
  useEffect(() => {
    if (!selectedCurso) {
      setCursoAsignaturas([]);
      return;
    }
    const filtered = asignaturas.filter(a => {
      if (a.nivelCurso !== Number(selectedCurso)) return false;
      // Si es profesor, solo ver asignaturas que le pertenecen
      if (user?.role === 'PROFESOR') {
        const profe = profesores.find(p => p.rut === user.rut);
        if (profe && a.profesor?.id !== profe.id) return false;
      }
      return true;
    });
    setCursoAsignaturas(filtered);
    // Resetear asignatura si la anterior no está en este curso
    if (selectedAsignatura && !filtered.find(a => a.id === Number(selectedAsignatura))) {
      setSelectedAsignatura('');
    }
  }, [selectedCurso, asignaturas, selectedAsignatura]);

  // Cargar o inicializar la lista de asistencia para la clase seleccionada
  const loadClassAttendance = async () => {
    if (!selectedCurso || !selectedAsignatura || !selectedFecha) return;

    setClassLoaded(false);
    setSaveMessage('');

    try {
      const asignaturaId = Number(selectedAsignatura);
      const estudiantesCurso = students
        .filter(e => e.curso === Number(selectedCurso))
        .sort((a, b) => (a.apellido || '').localeCompare(b.apellido || ''));

      // Buscar asistencias ya registradas
      const res = await asistenciasApi.buscarPorClase(asignaturaId, selectedFecha);
      const existentes = res.data || [];

      // Mapear estudiantes con su estado actual (existente o PRESENTE por defecto)
      const lista = estudiantesCurso.map(e => {
        const existente = existentes.find(a => a.estudianteId === e.id);
        return {
          id: existente?.id || null,
          estudianteId: e.id,
          nombre: `${e.nombre} ${e.apellido}`,
          rut: e.rut,
          asignaturaId,
          fecha: selectedFecha,
          estado: existente?.estado || 'PRESENTE',
        };
      });

      setAsistenciaList(lista);
      setClassLoaded(true);
    } catch (e) {
      console.error('Error al cargar asistencia:', e);
    }
  };

  // Cambiar estado de un estudiante
  const handleStateChange = (estudianteId, newState) => {
    setAsistenciaList(prev =>
      prev.map(a => a.estudianteId === estudianteId ? { ...a, estado: newState } : a)
    );
  };

  // Guardar todas las asistencias
  const handleSaveAll = async () => {
    setSaving(true);
    setSaveMessage('');
    try {
      const records = asistenciaList.map(a => ({
        estudianteId: a.estudianteId,
        asignaturaId: a.asignaturaId,
        fecha: a.fecha,
        estado: a.estado,
      }));
      await asistenciasApi.crearBatch(records);
      setSaveMessage('success');
      // Recargar para obtener los IDs asignados
      loadClassAttendance();
    } catch (e) {
      console.error('Error al guardar asistencias:', e);
      setSaveMessage('error');
    } finally {
      setSaving(false);
    }
  };

  // Contar estadísticas
  const stats = {
    PRESENTE: asistenciaList.filter(a => a.estado === 'PRESENTE').length,
    AUSENTE: asistenciaList.filter(a => a.estado === 'AUSENTE').length,
    ATRASADO: asistenciaList.filter(a => a.estado === 'ATRASADO').length,
    JUSTIFICADO: asistenciaList.filter(a => a.estado === 'JUSTIFICADO').length,
    total: asistenciaList.length,
  };

  const getCursoLabel = (curso) => {
    if (!curso) return '';
    const opt = CURSO_OPTIONS.find(c => c.value === Number(curso));
    return opt ? opt.label : `${curso}°`;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Asistencia</h1>
        <p className="text-sm text-gray-500 mt-1">Toma de asistencia por curso</p>
      </div>

      {/* Selectores */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
            <select
              value={selectedCurso}
              onChange={(e) => { setSelectedCurso(e.target.value); setClassLoaded(false); }}
              className="select-field"
            >
              <option value="">Seleccionar curso...</option>
              {availableCursos.map(curso => (
                <option key={curso} value={curso}>{getCursoLabel(curso)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asignatura</label>
            <select
              value={selectedAsignatura}
              onChange={(e) => { setSelectedAsignatura(e.target.value); setClassLoaded(false); }}
              className="select-field"
              disabled={!selectedCurso}
            >
              <option value="">Seleccionar asignatura...</option>
              {cursoAsignaturas.map(a => (
                <option key={a.id} value={a.id}>
                  {a.nombre} — {a.profesor ? `${a.profesor.nombre} ${a.profesor.apellido}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input
              type="date"
              value={selectedFecha}
              onChange={(e) => { setSelectedFecha(e.target.value); setClassLoaded(false); }}
              className="input-field"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={loadClassAttendance}
              disabled={!selectedCurso || !selectedAsignatura || !selectedFecha}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Search size={16} />
              Cargar Lista
            </button>
          </div>
        </div>
      </div>

      {/* Lista de asistencia */}
      {classLoaded && (
        <div className="card">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <GraduationCap size={20} className="text-blue-500" />
                {getCursoLabel(selectedCurso)}
                <span className="text-sm font-normal text-gray-400">—</span>
                <BookOpen size={16} className="text-gray-400" />
                <span className="text-base font-normal">
                  {cursoAsignaturas.find(a => a.id === Number(selectedAsignatura))?.nombre || ''}
                </span>
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {formatLocalDate(selectedFecha, 'es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                {' · '}
                {stats.total} estudiantes
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Estadísticas rápidas */}
              <div className="hidden sm:flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {stats.PRESENTE} Presentes
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  {stats.AUSENTE} Ausentes
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  {stats.ATRASADO} Atrasados
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  {stats.JUSTIFICADO} Justificados
                </span>
              </div>

              <button
                onClick={handleSaveAll}
                disabled={saving || asistenciaList.length === 0}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {saving ? 'Guardando...' : 'Guardar Todo'}
              </button>
            </div>
          </div>

          {saveMessage === 'success' && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-sm text-emerald-700">
              <CheckCircle2 size={18} />
              Asistencia guardada correctamente
            </div>
          )}

          {saveMessage === 'error' && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-600">
              <AlertCircle size={18} />
              Error al guardar la asistencia. Intenta de nuevo.
            </div>
          )}

          {/* Tabla de estudiantes */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header w-12">#</th>
                  <th className="table-header">Estudiante</th>
                  <th className="table-header hidden sm:table-cell">RUT</th>
                  <th className="table-header w-44">Estado</th>
                </tr>
              </thead>
              <tbody>
                {asistenciaList.map((a, idx) => (
                  <tr key={a.estudianteId} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell text-gray-400 text-center text-sm">{idx + 1}</td>
                    <td className="table-cell font-medium">
                      <span className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                          {a.nombre.charAt(0)}
                        </div>
                        {a.nombre}
                      </span>
                    </td>
                    <td className="table-cell text-gray-500 text-sm hidden sm:table-cell">{a.rut}</td>
                    <td className="table-cell">
                      <div className="flex gap-1.5">
                        {ESTADOS.map(estado => (
                          <button
                            key={estado}
                            onClick={() => handleStateChange(a.estudianteId, estado)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                              a.estado === estado
                                ? `${estadoColors[estado]} ring-2 ring-offset-1 ring-${estado === 'PRESENTE' ? 'emerald' : estado === 'AUSENTE' ? 'red' : estado === 'ATRASADO' ? 'orange' : 'amber'}-400`
                                : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300 hover:text-gray-600'
                            }`}
                          >
                            {estadoLabels[estado]}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {asistenciaList.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <GraduationCap size={48} className="mx-auto mb-3 text-gray-200" />
                <p>No hay estudiantes en este curso</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Estado inicial */}
      {!classLoaded && !loading && (
        <div className="card">
          <div className="text-center py-16 text-gray-400">
            <CalendarCheck size={64} className="mx-auto mb-4 text-gray-200" />
            <p className="text-lg font-medium text-gray-500 mb-1">Selecciona un curso y asignatura</p>
            <p className="text-sm">Luego haz clic en "Cargar Lista" para tomar asistencia</p>
          </div>
        </div>
      )}
    </div>
  );
}

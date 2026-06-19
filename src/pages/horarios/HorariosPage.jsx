import { useState, useEffect } from 'react';
import { horariosApi, asignaturasApi, profesoresApi, estudiantesApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { Clock, BookOpen, User, School, Plus, Trash2, MapPin, X } from 'lucide-react';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const HORAS = ['08:00', '08:45', '09:30', '10:15', '11:00', '11:45', '12:30', '13:15', '14:00', '14:45', '15:30', '16:15'];

export default function HorariosPage() {
  const { user } = useAuth();
  const canEdit = user?.role === 'UTP' || user?.role === 'PROFESOR';
  const [horarios, setHorarios] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCurso, setSelectedCurso] = useState(undefined);
  const [selectedProfesor, setSelectedProfesor] = useState(undefined);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [form, setForm] = useState({
    asignaturaId: 0,
    profesorId: 0,
    curso: 1,
    dia: 1,
    horaInicio: '08:00',
    horaFin: '08:45',
    sala: ''
  });

  const load = async () => {
    try {
      const [hRes, aRes, pRes] = await Promise.all([
        horariosApi.listar(),
        asignaturasApi.listar(),
        profesoresApi.listar()
      ]);
      setHorarios(hRes.data);
      setAsignaturas(aRes.data);
      setProfesores(pRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const loadWithAutoSelect = async () => {
      await load();
      // Si es ALUMNO, auto-seleccionar su curso
      if (user?.role === 'ALUMNO') {
        try {
          const eRes = await estudiantesApi.listar();
          const yo = eRes.data.find(e => e.rut === user.rut);
          if (yo?.curso) setSelectedCurso(yo.curso);
        } catch { /* ignore */ }
      }
    };
    loadWithAutoSelect();
  }, [user?.rut, user?.role]);

  // También auto-filtrar para PROFESOR: seleccionar su propio id
  useEffect(() => {
    if (user?.role === 'PROFESOR' && profesores.length > 0) {
      const yo = profesores.find(p => p.rut === user.rut);
      if (yo) {
        setSelectedProfesor(yo.id);
      }
    }
  }, [user?.rut, user?.role, profesores]);

  // Todos los niveles escolares ordenados: 1°-8° Básico y 1°-4° Medio
  const cursos = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  // Para profesor: filtrar solo sus horarios
  let filteredHorarios = horarios;
  if (user?.role === 'PROFESOR') {
    const yo = profesores.find(p => p.rut === user.rut);
    if (yo) {
      filteredHorarios = horarios.filter(h => h.profesor?.id === yo.id);
    }
  }
  if (selectedCurso) {
    filteredHorarios = filteredHorarios.filter(h => h.curso === selectedCurso);
  }
  if (selectedProfesor) {
    filteredHorarios = filteredHorarios.filter(h => h.profesor?.id === selectedProfesor);
  }

  const getHorarioEnCelda = (dia, hora) => {
    return filteredHorarios.find(h => h.dia === dia && h.horaInicio === hora);
  };

  // Filtrar asignaturas y profesores según el curso seleccionado en el formulario
  const asignaturasDelCurso = form.curso
    ? asignaturas.filter(a => a.nivelCurso === form.curso)
    : asignaturas;

  const profesoresDelCurso = form.curso
    ? profesores.filter(p =>
        asignaturas.some(a => a.nivelCurso === form.curso && a.profesor?.id === p.id)
      )
    : profesores;

  // Al cambiar curso, reiniciar profesor/asignatura si la selección actual ya no es válida
  const handleCursoChange = (value) => {
    const curso = Number(value);
    setForm(prev => {
      const nuevasAsignaturas = asignaturas.filter(a => a.nivelCurso === curso);
      const nuevosProfesores = profesores.filter(p =>
        asignaturas.some(a => a.nivelCurso === curso && a.profesor?.id === p.id)
      );
      return {
        ...prev,
        curso,
        asignaturaId: nuevasAsignaturas.some(a => a.id === prev.asignaturaId) ? prev.asignaturaId : 0,
        profesorId: nuevosProfesores.some(p => p.id === prev.profesorId) ? prev.profesorId : 0,
      };
    });
  };

  const getCursoLabel = (nivel) => {
    if (!nivel) return '';
    if (nivel <= 8) return `${nivel}° Básico`;
    return `${nivel - 8}° Medio`;
  };

  const getAsignaturaName = (h) => h.asignatura?.nombre || '—';
  const getProfesorName = (h) => {
    const p = h.profesor;
    return p?.nombre ? `${p.nombre} ${p.apellido || ''}`.trim() : '';
  };

  const handleCreate = async () => {
    try {
      await horariosApi.crear({
        asignatura: { id: form.asignaturaId },
        profesor: form.profesorId ? { id: form.profesorId } : undefined,
        curso: form.curso,
        dia: form.dia,
        horaInicio: form.horaInicio,
        horaFin: form.horaFin,
        sala: form.sala || undefined
      });
      setShowForm(false);
      setForm({ asignaturaId: 0, profesorId: 0, curso: 1, dia: 1, horaInicio: '08:00', horaFin: '08:45', sala: '' });
      load();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    try { await horariosApi.eliminar(id); setHorarios(prev => prev.filter(h => h.id !== id)); setDeleteId(null); }
    catch (e) { console.error(e); }
  };

  if (loading) return (
    <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Horarios</h1>
          <p className="text-sm text-gray-500 mt-1">Gestión de horarios de clases</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {user?.role !== 'ALUMNO' && (
            <select
              value={selectedCurso || ''}
              onChange={(e) => setSelectedCurso(e.target.value ? Number(e.target.value) : undefined)}
              className="select-field max-w-[200px]"
            >
              <option value="">Todos los cursos</option>
              {cursos.map(c => <option key={c} value={c}>{getCursoLabel(c)}</option>)}
            </select>
          )}
          {user?.role !== 'ALUMNO' && (
            <select
              value={selectedProfesor || ''}
              onChange={(e) => setSelectedProfesor(e.target.value ? Number(e.target.value) : undefined)}
              className="select-field max-w-[200px]"
            >
              <option value="">Todos los profesores</option>
              {profesores.map(p => (
                <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>
              ))}
            </select>
          )}
          {canEdit && (
            <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
              <Plus size={18} /> Agregar Bloque
            </button>
          )}
        </div>
      </div>

      {/* Indicador visual del filtro activo */}
      {selectedCurso && (
        <div className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl px-5 py-3 shadow-sm">
          <School size={20} />
          <span className="font-semibold">
            Mostrando horario de <span className="font-bold underline underline-offset-2">{getCursoLabel(selectedCurso)}</span>
          </span>
          {user?.role !== 'ALUMNO' && (
            <button
              onClick={() => setSelectedCurso(undefined)}
              className="ml-auto p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              <X size={14} />
              Limpiar filtro
            </button>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-[80px_repeat(5,1fr)] gap-px bg-gray-200 rounded-t-xl overflow-hidden">
            <div className="bg-gray-800 p-3 text-white text-xs font-semibold flex items-center justify-center gap-1">
              <Clock size={14} /> Hora
            </div>
            {DIAS.map((dia, i) => (
              <div key={dia} className="bg-gray-800 p-3 text-white text-xs font-semibold text-center">
                {dia} {i + 1}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-[80px_repeat(5,1fr)] gap-px bg-gray-200">
            {HORAS.map(hora => (
              <>
                <div key={`h-${hora}`} className="bg-gray-50 p-1.5 text-xs text-gray-500 font-medium flex items-center justify-center">
                  {hora}
                </div>
                {[1, 2, 3, 4, 5].map(dia => {
                  const h = getHorarioEnCelda(dia, hora);
                  return (
                    <div key={`${dia}-${hora}`} className="bg-white p-1 min-h-[65px] relative group">
                      {h ? (
                        <div className="h-full bg-blue-50 border border-blue-200 rounded-lg p-1.5">
                          <div className="flex items-start justify-between">
                            <p className="text-xs font-semibold text-blue-700 leading-tight">{getAsignaturaName(h)}</p>
                            {canEdit && (
                              <button
                                onClick={() => setDeleteId(h.id)}
                                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-100 text-red-500 transition-opacity"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                          <p className="text-[10px] text-blue-500 mt-0.5">{getProfesorName(h)}</p>
                          {h.sala && (
                            <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                              <MapPin size={10} /> {h.sala}
                            </p>
                          )}
                          <p className="text-[9px] text-gray-400 mt-0.5">{h.horaInicio}-{h.horaFin}</p>
                        </div>
                      ) : canEdit ? (
                        <div className="h-full flex items-center justify-center">
                          <button
                            onClick={() => {
                              setForm(prev => ({ ...prev, dia, horaInicio: hora }));
                              setShowForm(true);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-blue-500 transition-opacity"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      </div>

      {canEdit && showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold">Nuevo Bloque Horario</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asignatura *</label>
                <select value={form.asignaturaId} onChange={(e) => setForm({ ...form, asignaturaId: Number(e.target.value) })} className="select-field" required>
                  <option value={0}>Seleccionar...</option>
                  {asignaturasDelCurso.length === 0 && form.curso && (
                    <option value={0} disabled>— Sin asignaturas para este curso —</option>
                  )}
                  {asignaturasDelCurso.map(a => (
                    <option key={a.id} value={a.id}>{a.nombre}</option>
                  ))}
                </select>
                {form.curso && asignaturasDelCurso.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">No hay asignaturas registradas para {getCursoLabel(form.curso)}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profesor
                  {form.curso && profesoresDelCurso.length > 0 && (
                    <span className="text-xs text-gray-400 font-normal ml-1">({profesoresDelCurso.length} disponible{profesoresDelCurso.length !== 1 ? 's' : ''})</span>
                  )}
                </label>
                <select value={form.profesorId} onChange={(e) => setForm({ ...form, profesorId: Number(e.target.value) })} className="select-field">
                  <option value={0}>Sin profesor</option>
                  {profesoresDelCurso.length === 0 && form.curso && (
                    <option value={0} disabled>— Sin profesores para este curso —</option>
                  )}
                  {profesoresDelCurso.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>
                  ))}
                </select>
                {form.curso && profesoresDelCurso.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">No hay profesores asignados a {getCursoLabel(form.curso)}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Curso *</label>
                  <select value={form.curso} onChange={(e) => handleCursoChange(e.target.value)} className="select-field">
                    {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}° Básico</option>)}
                    {[9,10,11,12].map((n, i) => <option key={n} value={n}>{i+1}° Medio</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Día *</label>
                  <select value={form.dia} onChange={(e) => setForm({ ...form, dia: Number(e.target.value) })} className="select-field">
                    {DIAS.map((d, i) => <option key={i+1} value={i+1}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora Inicio *</label>
                  <select value={form.horaInicio} onChange={(e) => setForm({ ...form, horaInicio: e.target.value })} className="select-field">
                    {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora Fin *</label>
                  <select value={form.horaFin} onChange={(e) => setForm({ ...form, horaFin: e.target.value })} className="select-field">
                    {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sala</label>
                <input type="text" value={form.sala} onChange={(e) => setForm({ ...form, sala: e.target.value })}
                  placeholder="Ej: A-101" className="input-field" />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
              <button onClick={handleCreate} className="btn-primary">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {canEdit && deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Eliminar bloque</h3>
            <p className="text-sm text-gray-600 mb-6">¿Estás seguro de eliminar este bloque horario?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-secondary">Cancelar</button>
              <button onClick={() => handleDelete(deleteId)} className="btn-danger">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <School size={18} />
            {selectedCurso ? (
              <>
                Bloques
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                  {getCursoLabel(selectedCurso)}
                </span>
              </>
            ) : (
              'Todos los bloques'
            )}
          </h3>
          {selectedCurso && user?.role !== 'ALUMNO' && (
            <button
              onClick={() => setSelectedCurso(undefined)}
              className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
            >
              <X size={14} />
              Limpiar filtro
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="table-header">Curso</th>
                <th className="table-header">Día</th>
                <th className="table-header">Horario</th>
                <th className="table-header">Asignatura</th>
                <th className="table-header">Profesor</th>
                <th className="table-header">Sala</th>
              </tr>
            </thead>
            <tbody>
              {filteredHorarios.sort((a, b) => a.curso - b.curso || a.dia - b.dia || a.horaInicio.localeCompare(b.horaInicio)).map(h => (
                <tr key={h.id} className="hover:bg-gray-50">
                  <td className="table-cell"><span className="badge-info">{getCursoLabel(h.curso)}</span></td>
                  <td className="table-cell">{DIAS[h.dia - 1]}</td>
                  <td className="table-cell">{h.horaInicio} - {h.horaFin}</td>
                  <td className="table-cell"><BookOpen size={14} className="inline text-gray-400 mr-1" />{getAsignaturaName(h)}</td>
                  <td className="table-cell">{getProfesorName(h) || '—'}</td>
                  <td className="table-cell">{h.sala || '—'}</td>
                </tr>
              ))}
              {filteredHorarios.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">Sin horarios registrados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

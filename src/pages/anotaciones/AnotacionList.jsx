import { useState, useEffect } from 'react';
import { anotacionesApi, estudiantesApi } from '../../api/endpoints';
import { MessageSquareText, Search, GraduationCap, Plus } from 'lucide-react';
import { getLocalDateString, formatLocalDate } from '../../utils/dateUtils';

const tipoColors = {
  POSITIVA: 'badge-success',
  NEGATIVA: 'badge-danger',
  NEUTRAL: 'badge-neutral'
};

export default function AnotacionList() {
  const [items, setItems] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ estudianteId: 0, profesorId: 1, descripcion: '', tipo: 'NEUTRAL', fecha: getLocalDateString() });

  const load = async () => {
    try {
      const [anotRes, estRes] = await Promise.all([anotacionesApi.listar(), estudiantesApi.listar()]);
      setItems(anotRes.data);
      setStudents(estRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    try {
      await anotacionesApi.crear(form);
      setShowForm(false);
      setForm({ estudianteId: 0, profesorId: 1, descripcion: '', tipo: 'NEUTRAL', fecha: getLocalDateString() });
      load();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    try { await anotacionesApi.eliminar(id); setItems(prev => prev.filter(a => a.id !== id)); setDeleteId(null); }
    catch (e) { console.error(e); }
  };

  const getStudentName = (id) => {
    const s = students.find(s => s.id === id);
    return s ? `${s.nombre} ${s.apellido}` : `ID: ${id}`;
  };

  const filtered = items.filter(a =>
    getStudentName(a.estudianteId).toLowerCase().includes(search.toLowerCase()) ||
    a.descripcion.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Anotaciones</h1>
          <p className="text-sm text-gray-500 mt-1">Observaciones y anotaciones de estudiantes</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Nueva Anotación
        </button>
      </div>

      <div className="card">
        <div className="relative mb-4">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Buscar por estudiante o descripción..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
        </div>

        {showForm && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <h3 className="font-semibold text-blue-800 mb-3">Nueva Anotación</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <select value={form.estudianteId} onChange={(e) => setForm({ ...form, estudianteId: Number(e.target.value) })} className="select-field">
                <option value={0}>Estudiante...</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.nombre} {s.apellido}</option>)}
              </select>
              <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="select-field">
                <option value="NEUTRAL">Neutral</option>
                <option value="POSITIVA">Positiva</option>
                <option value="NEGATIVA">Negativa</option>
              </select>
              <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} className="input-field" />
            </div>
            <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              placeholder="Descripción de la anotación..." className="input-field mb-3" rows={3} />
            <div className="flex gap-2">
              <button onClick={handleCreate} className="btn-success text-sm">Guardar</button>
              <button onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancelar</button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="space-y-3">
            {filtered.map((a) => (
              <div key={a.id} className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <GraduationCap size={16} className="text-gray-400" />
                    <span className="font-medium text-gray-800">{getStudentName(a.estudianteId)}</span>
                    <span className={tipoColors[a.tipo]}>{a.tipo}</span>
                    {a.profesorId && <span className="text-xs text-gray-400">Prof. ID: {a.profesorId}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{formatLocalDate(a.fecha, 'es-CL')}</span>
                    <button onClick={() => setDeleteId(a.id)} className="p-1 rounded hover:bg-red-50 text-red-500"><MessageSquareText size={14} /></button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 ml-7">{a.descripcion}</p>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-500"><MessageSquareText size={48} className="mx-auto mb-3 text-gray-300" />No se encontraron anotaciones</div>
            )}
          </div>
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Confirmar eliminación</h3>
            <p className="text-sm text-gray-600 mb-6">¿Estás seguro?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-secondary">Cancelar</button>
              <button onClick={() => handleDelete(deleteId)} className="btn-danger">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

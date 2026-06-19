import { useState, useEffect } from 'react';
import { notasApi, estudiantesApi, evaluacionesApi, asignaturasApi, profesoresApi } from '../../api/endpoints';
import { Plus, Search, Calculator, GraduationCap, ClipboardList, Trash2 } from 'lucide-react';
import Pagination from '../../components/Pagination';
import Skeleton from '../../components/Skeleton';
import { useAuth } from '../../context/AuthContext';

export default function NotasList() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [students, setStudents] = useState([]);
  const [evals, setEvals] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ estudianteId: 0, evaluacionId: 0, valor: 0 });
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const load = async () => {
    try {
      const [notasRes, estRes, evalRes, asigRes, profRes] = await Promise.all([
        notasApi.listar(), estudiantesApi.listar(), evaluacionesApi.listar(),
        asignaturasApi.listar(), profesoresApi.listar()
      ]);
      setItems(notasRes.data);
      setStudents(estRes.data);
      setEvals(evalRes.data);
      setAsignaturas(asigRes.data);
      setProfesores(profRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => { setCurrentPage(1); }, [search]);

  const handleCreate = async () => {
    try {
      await notasApi.crear({
        estudiante: { id: formData.estudianteId },
        evaluacion: { id: formData.evaluacionId },
        valor: formData.valor
      });
      setShowForm(false);
      setFormData({ estudianteId: 0, evaluacionId: 0, valor: 0 });
      load();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    try { await notasApi.eliminar(id); setItems(prev => prev.filter(n => n.id !== id)); setDeleteId(null); }
    catch (e) { console.error(e); }
  };

  // Determinar evaluaciones visibles según el rol
  const visibleEvalIds = (() => {
    if (user?.role !== 'PROFESOR') return null; // null = mostrar todo
    const profe = profesores.find(p => p.rut === user.rut);
    if (!profe) return null;
    const misAsignaturaIds = asignaturas
      .filter(a => a.profesor?.id === profe.id)
      .map(a => a.id);
    return new Set(
      evals
        .filter(e => misAsignaturaIds.includes(e.asignatura?.id))
        .map(e => e.id)
    );
  })();

  const getStudentName = (id) => {
    const s = students.find(s => s.id === id);
    return s ? `${s.nombre} ${s.apellido}` : `ID: ${id}`;
  };

  const getEvalName = (id) => {
    const e = evals.find(e => e.id === id);
    return e ? e.nombre : `ID: ${id}`;
  };

  const notasVisibles = visibleEvalIds
    ? items.filter(n => visibleEvalIds.has(n.evaluacion?.id || n.evaluacion))
    : items;

  const filtered = notasVisibles.filter(n => {
    const studentName = getStudentName(n.estudiante?.id || n.estudiante).toLowerCase();
    const evalName = getEvalName(n.evaluacion?.id || n.evaluacion).toLowerCase();
    return studentName.includes(search.toLowerCase()) || evalName.includes(search.toLowerCase());
  });
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const evalsVisibles = visibleEvalIds
    ? evals.filter(e => visibleEvalIds.has(e.id))
    : evals;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notas</h1>
          <p className="text-sm text-gray-500 mt-1">Registro y gestión de calificaciones</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Registrar Nota
        </button>
      </div>

      <div className="card">
        <div className="relative mb-4">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Buscar por estudiante o evaluación..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
        </div>

        {showForm && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <h3 className="font-semibold text-blue-800 mb-3">Nueva Nota</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <select value={formData.estudianteId} onChange={(e) => setFormData({ ...formData, estudianteId: Number(e.target.value) })}
                className="select-field">
                <option value={0}>Estudiante...</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.nombre} {s.apellido}</option>)}
              </select>
              <select value={formData.evaluacionId} onChange={(e) => setFormData({ ...formData, evaluacionId: Number(e.target.value) })}
                className="select-field">
                <option value={0}>Evaluación...</option>
                {evalsVisibles.map(e => <option key={e.id} value={e.id}>{e.nombre} ({e.tipo})</option>)}
              </select>
              <input type="number" step="0.1" min="1" max="7" value={formData.valor || ''}
                onChange={(e) => setFormData({ ...formData, valor: Number(e.target.value) })}
                placeholder="Nota (1.0-7.0)" className="input-field" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreate} className="btn-success text-sm">Guardar</button>
              <button onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancelar</button>
            </div>
          </div>
        )}

        {loading ? (
          <Skeleton.Table rows={8} columns={4} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Estudiante</th>
                  <th className="table-header">Evaluación</th>
                  <th className="table-header">Nota</th>
                  <th className="table-header text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((n) => (
                  <tr key={n.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-medium">
                      <span className="flex items-center gap-1.5">
                        <GraduationCap size={14} className="text-gray-400" />
                        {getStudentName(n.estudiante?.id || n.estudiante)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="flex items-center gap-1.5">
                        <ClipboardList size={14} className="text-gray-400" />
                        {getEvalName(n.evaluacion?.id || n.evaluacion)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-semibold ${
                        n.valor >= 4.0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {n.valor.toFixed(1)}
                      </span>
                    </td>
                    <td className="table-cell text-right">
                      <button onClick={() => setDeleteId(n.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-600"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-12 text-gray-500"><Calculator size={48} className="mx-auto mb-3 text-gray-300" />No se encontraron notas</td></tr>
                )}
              </tbody>
            </table>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filtered.length} itemsPerPage={itemsPerPage} />
          </div>
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Confirmar eliminación</h3>
            <p className="text-sm text-gray-600 mb-6">¿Estás seguro de eliminar esta nota?</p>
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

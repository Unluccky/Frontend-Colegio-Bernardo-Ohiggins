import { useState, useEffect } from 'react';
import { evaluacionesApi, asignaturasApi, profesoresApi } from '../../api/endpoints';
import { Plus, Search, Pencil, Trash2, ClipboardList, Calendar, BookOpen } from 'lucide-react';
import EvaluacionForm from './EvaluacionForm';
import { useAuth } from '../../context/AuthContext';

export default function EvaluacionList() {
  const { user, hasRole } = useAuth();
  const [items, setItems] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const load = async () => {
    try {
      const [evalRes, asigRes, profRes] = await Promise.all([
        evaluacionesApi.listar(), asignaturasApi.listar(), profesoresApi.listar()
      ]);
      setItems(evalRes.data);
      setAsignaturas(asigRes.data);
      setProfesores(profRes.data);
    }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    try { await evaluacionesApi.eliminar(id); setItems(prev => prev.filter(e => e.id !== id)); setDeleteId(null); }
    catch (e) { console.error(e); }
  };

  const tipoColors = {
    PRUEBA: 'badge-danger', TAREA: 'badge-warning', TRABAJO: 'badge-info', DISERTACION: 'badge-success'
  };

  // Determinar evaluaciones visibles según el rol
  const evaluacionesVisibles = (() => {
    if (user?.role !== 'PROFESOR') return items; // UTP ve todo
    const profe = profesores.find(p => p.rut === user.rut);
    if (!profe) return items;
    const misAsignaturaIds = asignaturas
      .filter(a => a.profesor?.id === profe.id)
      .map(a => a.id);
    return items.filter(e => misAsignaturaIds.includes(e.asignatura?.id));
  })();

  const filtered = evaluacionesVisibles.filter(e =>
    `${e.nombre} ${e.tipo}`.toLowerCase().includes(search.toLowerCase())
  );

  // IDs de asignaturas permitidas para el formulario
  const asignaturasPermitidas = (() => {
    if (user?.role !== 'PROFESOR') return null; // null = mostrar todas
    const profe = profesores.find(p => p.rut === user.rut);
    if (!profe) return null;
    return asignaturas
      .filter(a => a.profesor?.id === profe.id)
      .map(a => a.id);
  })();

  const canEdit = hasRole('UTP') || hasRole('PROFESOR');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Evaluaciones</h1>
          <p className="text-sm text-gray-500 mt-1">Planificación y gestión de evaluaciones</p>
        </div>
        {canEdit && (
          <button onClick={() => { setEditItem(null); setShowForm(true); }} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Nueva Evaluación
          </button>
        )}
      </div>

      <div className="card">
        <div className="relative mb-4">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Buscar evaluación..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Nombre</th>
                  <th className="table-header">Tipo</th>
                  <th className="table-header">Asignatura</th>
                  <th className="table-header">Fecha</th>
                  {(canEdit) && <th className="table-header text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-medium">{e.nombre}</td>
                    <td className="table-cell"><span className={tipoColors[e.tipo] || 'badge-neutral'}>{e.tipo}</span></td>
                    <td className="table-cell">
                      <span className="flex items-center gap-1.5">
                        <BookOpen size={14} className="text-gray-400" />
                        {e.asignatura?.nombre || '—'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-gray-400" />
                        {e.fecha ? new Date(e.fecha).toLocaleDateString('es-CL') : '—'}
                      </span>
                    </td>
                    {canEdit && (
                      <td className="table-cell text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setEditItem(e); setShowForm(true); }} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"><Pencil size={16} /></button>
                          <button onClick={() => setDeleteId(e.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-600"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-12 text-gray-500"><ClipboardList size={48} className="mx-auto mb-3 text-gray-300" />No se encontraron evaluaciones</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && <EvaluacionForm item={editItem} onClose={() => { setShowForm(false); setEditItem(null); }} onSave={() => { load(); setShowForm(false); setEditItem(null); }} asignaturasPermitidas={asignaturasPermitidas} />}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Confirmar eliminación</h3>
            <p className="text-sm text-gray-600 mb-6">¿Estás seguro de eliminar esta evaluación?</p>
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

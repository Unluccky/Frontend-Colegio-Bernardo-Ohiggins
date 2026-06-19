import { useState, useEffect } from 'react';
import { asignaturasApi } from '../../api/endpoints';
import { Plus, Search, Pencil, Trash2, BookOpen, School, User } from 'lucide-react';
import AsignaturaForm from './AsignaturaForm';

export default function AsignaturaList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const load = async () => {
    try { const res = await asignaturasApi.listar(); setItems(res.data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    try { await asignaturasApi.eliminar(id); setItems(prev => prev.filter(e => e.id !== id)); setDeleteId(null); }
    catch (e) { console.error(e); }
  };

  const filtered = items.filter(e =>
    `${e.nombre} ${e.profesor ? ((e.profesor?.nombre || '') + ' ' + (e.profesor?.apellido || '')) : ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const getCursoLabel = (curso) => {
    if (!curso) return null;
    if (curso <= 8) return `${curso}° Básico`;
    return `${curso - 8}° Medio`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Asignaturas</h1>
          <p className="text-sm text-gray-500 mt-1">Gestión de asignaturas y materias</p>
        </div>
        <button onClick={() => { setEditItem(null); setShowForm(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Nueva Asignatura
        </button>
      </div>

      <div className="card">
        <div className="relative mb-4">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Buscar asignatura..." value={search}
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
                  <th className="table-header">Nivel Curso</th>
                  <th className="table-header">Profesor</th>
                  <th className="table-header text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-medium flex items-center gap-2">
                      <BookOpen size={16} className="text-blue-500" />
                      {e.nombre}
                    </td>
                    <td className="table-cell">
                      {e.nivelCurso ? <span className="badge-info">{getCursoLabel(e.nivelCurso)}</span> : '—'}
                    </td>
                    <td className="table-cell">
                      {e.profesor ? (
                        <span className="flex items-center gap-1.5">
                          <User size={14} className="text-gray-400" />
                          {e.profesor?.nombre || ''} {e.profesor?.apellido || ''}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setEditItem(e); setShowForm(true); }} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"><Pencil size={16} /></button>
                        <button onClick={() => setDeleteId(e.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-600"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-12 text-gray-500"><BookOpen size={48} className="mx-auto mb-3 text-gray-300" />No se encontraron asignaturas</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && <AsignaturaForm item={editItem} onClose={() => { setShowForm(false); setEditItem(null); }} onSave={() => { load(); setShowForm(false); setEditItem(null); }} />}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Confirmar eliminación</h3>
            <p className="text-sm text-gray-600 mb-6">¿Estás seguro de eliminar esta asignatura?</p>
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

import { useState, useEffect } from 'react';
import { estudiantesApi } from '../../api/endpoints';
import { Plus, Search, Pencil, Trash2, GraduationCap, Mail } from 'lucide-react';
import EstudianteForm from './EstudianteForm';
import Pagination from '../../components/Pagination';
import Skeleton from '../../components/Skeleton';

export default function EstudianteList() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const load = async () => {
    try {
      const res = await estudiantesApi.listar();
      setEstudiantes(res.data);
    } catch (e) {
      console.error('Error loading estudiantes:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => { setCurrentPage(1); }, [search]);

  const handleDelete = async (id) => {
    try {
      await estudiantesApi.eliminar(id);
      setEstudiantes(prev => prev.filter(e => e.id !== id));
      setDeleteId(null);
    } catch (e) {
      console.error('Error deleting:', e);
    }
  };

  const getCursoLabel = (curso) => {
    if (!curso) return '—';
    if (curso <= 8) {
      return `${curso}° Básico`;
    }
    return `${curso - 8}° Medio`;
  };

  const filtered = estudiantes.filter(e =>
    `${e.nombre} ${e.apellido} ${e.rut} ${e.email}`.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Estudiantes</h1>
          <p className="text-sm text-gray-500 mt-1">Gestión de estudiantes del colegio</p>
        </div>
        <button onClick={() => { setEditItem(null); setShowForm(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Nuevo Estudiante
        </button>
      </div>

      <div className="card">
        <div className="relative mb-4">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, RUT o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        {loading ? (
          <Skeleton.Table rows={8} columns={6} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">RUT</th>
                  <th className="table-header">Nombre</th>
                  <th className="table-header">Apellido</th>
                  <th className="table-header">Email</th>
                  <th className="table-header">Curso</th>
                  <th className="table-header text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-medium">{e.rut}</td>
                    <td className="table-cell">{e.nombre}</td>
                    <td className="table-cell">{e.apellido}</td>
                    <td className="table-cell">
                      <span className="flex items-center gap-1.5">
                        <Mail size={14} className="text-gray-400" />
                        {e.email || '—'}
                      </span>
                    </td>
                    <td className="table-cell">
                      {e.curso ? (
                        <span className="badge-info">{getCursoLabel(e.curso)}</span>
                      ) : '—'}
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setEditItem(e); setShowForm(true); }}
                          className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteId(e.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-500">
                      <GraduationCap size={48} className="mx-auto mb-3 text-gray-300" />
                      No se encontraron estudiantes
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filtered.length} itemsPerPage={itemsPerPage} />
          </div>
        )}
      </div>

      {showForm && (
        <EstudianteForm
          item={editItem}
          onClose={() => { setShowForm(false); setEditItem(null); }}
          onSave={() => { load(); setShowForm(false); setEditItem(null); }}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Confirmar eliminación</h3>
            <p className="text-sm text-gray-600 mb-6">¿Estás seguro de eliminar este estudiante? Esta acción no se puede deshacer.</p>
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

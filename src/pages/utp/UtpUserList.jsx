import { useState, useEffect } from 'react';
import { usuariosUtpApi } from '../../api/endpoints';
import { Plus, Search, Trash2, UserCog, ShieldCheck } from 'lucide-react';
import UtpUserForm from './UtpUserForm';

export default function UtpUserList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [deleteRut, setDeleteRut] = useState(null);

  const load = async () => {
    try {
      const res = await usuariosUtpApi.listar();
      setItems(res.data);
    } catch (e) {
      console.error('Error loading UTP users:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (rut) => {
    try {
      await usuariosUtpApi.eliminar(rut);
      setItems(prev => prev.filter(e => e.rut !== rut));
      setDeleteRut(null);
    } catch (e) {
      console.error('Error deleting UTP user:', e);
    }
  };

  const filtered = items.filter(e =>
    `${e.rut} ${e.role}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Usuarios UTP</h1>
          <p className="text-sm text-gray-500 mt-1">Gestión de usuarios con rol UTP (Unidad Técnico Pedagógica)</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Nuevo UTP
        </button>
      </div>

      <div className="card">
        <div className="relative mb-4">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por RUT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">RUT</th>
                  <th className="table-header">Rol</th>
                  <th className="table-header text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.rut} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-medium">{e.rut}</td>
                    <td className="table-cell">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-purple-600 bg-purple-50">
                        <ShieldCheck size={14} />
                        {e.role}
                      </span>
                    </td>
                    <td className="table-cell text-right">
                      <button
                        onClick={() => setDeleteRut(e.rut)}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-12 text-gray-500">
                      <UserCog size={48} className="mx-auto mb-3 text-gray-300" />
                      No se encontraron usuarios UTP
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <UtpUserForm
          onClose={() => setShowForm(false)}
          onSave={() => { load(); setShowForm(false); }}
        />
      )}

      {deleteRut && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Confirmar eliminación</h3>
            <p className="text-sm text-gray-600 mb-6">
              ¿Estás seguro de eliminar al usuario UTP con RUT <strong>{deleteRut}</strong>?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteRut(null)} className="btn-secondary">Cancelar</button>
              <button onClick={() => handleDelete(deleteRut)} className="btn-danger">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { apoderadosApi, estudiantesApi } from '../../api/endpoints';
import { X } from 'lucide-react';

export default function ApoderadoForm({ item, onClose, onSave }) {
  const [form, setForm] = useState(
    item || { nombre: '', apellido: '', rut: '', email: '', contrasena: '', estudiante: { id: 0 } }
  );
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    estudiantesApi.listar().then(res => setStudents(res.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        estudiante: form.estudiante
      };
      if (item?.id) {
        await apoderadosApi.actualizar(item.id, payload);
      } else {
        await apoderadosApi.crear(payload);
      }
      onSave();
    } catch {
      setError('Error al guardar. Verifica los datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">{item ? 'Editar Apoderado' : 'Nuevo Apoderado'}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
              <input type="text" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} className="input-field" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">RUT *</label>
            <input type="text" value={form.rut} onChange={(e) => setForm({ ...form, rut: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estudiante a cargo *</label>
            <select
              value={form.estudiante?.id || ''}
              onChange={(e) => setForm({ ...form, estudiante: { id: Number(e.target.value) } })}
              className="select-field"
              required
            >
              <option value="">Seleccionar estudiante...</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.nombre} {s.apellido} - {s.rut}</option>
              ))}
            </select>
          </div>
          {!item && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
              <input type="password" value={form.contrasena || ''} onChange={(e) => setForm({ ...form, contrasena: e.target.value })} className="input-field" required placeholder="••••••••" />
            </div>
          )}
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Guardando...' : item ? 'Actualizar' : 'Crear'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

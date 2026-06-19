import { useState, useEffect } from 'react';
import { asignaturasApi, profesoresApi } from '../../api/endpoints';
import { X } from 'lucide-react';

export default function AsignaturaForm({ item, onClose, onSave }) {
  const [form, setForm] = useState(
    item || { nombre: '', nivelCurso: undefined, profesor: null }
  );
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    profesoresApi.listar().then(res => setProfesores(res.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        nivelCurso: form.nivelCurso ? Number(form.nivelCurso) : undefined,
        profesor: form.profesor?.id ? { id: form.profesor.id } : null
      };
      if (item?.id) {
        await asignaturasApi.actualizar(item.id, payload);
      } else {
        await asignaturasApi.crear(payload);
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
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">{item ? 'Editar Asignatura' : 'Nueva Asignatura'}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nivel Curso</label>
            <select value={form.nivelCurso || ''} onChange={(e) => setForm({ ...form, nivelCurso: e.target.value ? Number(e.target.value) : undefined })} className="select-field">
              <option value="">Todos los niveles</option>
              {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}° Básico</option>)}
              {[9,10,11,12].map((n, i) => <option key={n} value={n}>{i+1}° Medio</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profesor</label>
            <select value={form.profesor?.id || ''} onChange={(e) => setForm({ ...form, profesor: e.target.value ? { id: Number(e.target.value) } : null })} className="select-field">
              <option value="">Sin profesor asignado</option>
              {profesores.map(p => (
                <option key={p.id} value={p.id}>{p.nombre} {p.apellido} - {p.especialidad || 'Sin especialidad'}</option>
              ))}
            </select>
          </div>
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

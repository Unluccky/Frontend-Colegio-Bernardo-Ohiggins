import { useState, useEffect } from 'react';
import { evaluacionesApi, asignaturasApi } from '../../api/endpoints';
import { X } from 'lucide-react';

export default function EvaluacionForm({ item, onClose, onSave, asignaturasPermitidas }) {
  const [form, setForm] = useState(
    item || { nombre: '', fecha: '', tipo: 'PRUEBA', asignatura: undefined }
  );
  const [asignaturas, setAsignaturas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    asignaturasApi.listar().then(res => {
      const todas = res.data;
      if (asignaturasPermitidas) {
        setAsignaturas(todas.filter(a => asignaturasPermitidas.includes(a.id)));
      } else {
        setAsignaturas(todas);
      }
    }).catch(() => {});
  }, [asignaturasPermitidas]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        asignatura: form.asignatura ? { id: Number(form.asignatura) } : undefined
      };
      if (item?.id) {
        await evaluacionesApi.actualizar(item.id, payload);
      } else {
        await evaluacionesApi.crear(payload);
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
          <h3 className="text-lg font-semibold text-gray-800">{item ? 'Editar Evaluación' : 'Nueva Evaluación'}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
            <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="select-field" required>
              <option value="PRUEBA">Prueba</option>
              <option value="TAREA">Tarea</option>
              <option value="TRABAJO">Trabajo</option>
              <option value="DISERTACION">Disertación</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asignatura *</label>
            <select value={form.asignatura?.id || ''} onChange={(e) => setForm({ ...form, asignatura: { id: Number(e.target.value) } })} className="select-field" required>
              <option value="">Seleccionar asignatura...</option>
              {asignaturas.map(a => (
                <option key={a.id} value={a.id}>{a.nombre} {a.nivelCurso ? `(${a.nivelCurso}°)` : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input type="date" value={form.fecha || ''} onChange={(e) => setForm({ ...form, fecha: e.target.value })} className="input-field" />
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

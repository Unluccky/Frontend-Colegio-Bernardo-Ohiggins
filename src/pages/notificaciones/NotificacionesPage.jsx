import { useState, useEffect } from 'react';
import { notificacionesApi } from '../../api/endpoints';
import { Bell, Search, Trash2, Check, AlertCircle, CalendarCheck, MessageSquareText, GraduationCap, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const tipoConfig = {
  ANOTACION: { icon: <AlertCircle size={16} />, label: 'Anotación', color: 'text-orange-600 bg-orange-50 border-orange-200' },
  ASISTENCIA: { icon: <CalendarCheck size={16} />, label: 'Asistencia', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  NOTA: { icon: <GraduationCap size={16} />, label: 'Nota', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  MENSAJE: { icon: <MessageSquareText size={16} />, label: 'Mensaje', color: 'text-purple-600 bg-purple-50 border-purple-200' },
};

export default function NotificacionesPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('');

  const load = async () => {
    try {
      const res = await notificacionesApi.listar();
      setItems(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleMarkAsRead = async (id) => {
    try {
      // Buscar la notificación, marcarla como leída
      const notif = items.find(n => n.id === id);
      if (!notif || notif.leida) return;
      // Actualizar via PUT no está disponible, así que eliminamos y recreamos
      // En su lugar, usamos el estado local para marcarla como leída visualmente
      setItems(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    try {
      await notificacionesApi.eliminar(id);
      setItems(prev => prev.filter(n => n.id !== id));
    } catch (e) { console.error(e); }
  };

  const tipos = [...new Set(items.map(n => n.tipo).filter(Boolean))];

  const filtered = items.filter(n => {
    const matchSearch = !search || `${n.titulo} ${n.mensaje}`.toLowerCase().includes(search.toLowerCase());
    const matchTipo = !selectedTipo || n.tipo === selectedTipo;
    return matchSearch && matchTipo;
  });

  const noLeidas = items.filter(n => !n.leida).length;

  if (loading) return (
    <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notificaciones</h1>
          <p className="text-sm text-gray-500 mt-1">
            {noLeidas > 0
              ? `Tienes ${noLeidas} notificación${noLeidas !== 1 ? 'es' : ''} sin leer`
              : 'No hay notificaciones pendientes'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar notificaciones..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 text-sm"
          />
        </div>
        <select
          value={selectedTipo}
          onChange={(e) => setSelectedTipo(e.target.value)}
          className="select-field max-w-[180px] text-sm"
        >
          <option value="">Todos los tipos</option>
          {tipos.map(t => (
            <option key={t} value={t}>{tipoConfig[t]?.label || t}</option>
          ))}
        </select>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="card text-center py-16">
            <Bell size={48} className="mx-auto mb-3 text-gray-200" />
            <p className="text-gray-500 font-medium">Sin notificaciones</p>
            <p className="text-sm text-gray-400 mt-1">No hay notificaciones que coincidan con tu búsqueda</p>
          </div>
        ) : (
          filtered.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).map(n => {
            const tipo = tipoConfig[n.tipo] || { icon: <Info size={16} />, label: n.tipo || 'General', color: 'text-gray-600 bg-gray-50 border-gray-200' };
            return (
              <div
                key={n.id}
                className={`card p-4 transition-all duration-200 ${!n.leida ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''}`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${tipo.color.split(' ').slice(1).join(' ')}`}>
                    {tipo.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${tipo.color}`}>
                        {tipo.label}
                      </span>
                      {!n.leida && (
                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full">
                          NUEVA
                        </span>
                      )}
                    </div>
                    <h3 className={`text-sm ${n.leida ? 'text-gray-600' : 'font-semibold text-gray-800'}`}>
                      {n.titulo}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.mensaje}</p>
                    <p className="text-[10px] text-gray-400 mt-1.5">
                      {new Date(n.fecha).toLocaleString('es-CL')}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {!n.leida && (
                      <button
                        onClick={() => handleMarkAsRead(n.id)}
                        className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-500 transition-colors"
                        title="Marcar como leída"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

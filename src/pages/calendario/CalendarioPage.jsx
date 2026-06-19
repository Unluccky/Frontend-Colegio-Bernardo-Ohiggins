import { useState, useEffect } from 'react';
import { evaluacionesApi } from '../../api/endpoints';
import { CalendarDays, ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react';

const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const tipoColors = {
  PRUEBA: 'bg-red-100 text-red-700 border-red-200',
  TAREA: 'bg-amber-100 text-amber-700 border-amber-200',
  TRABAJO: 'bg-blue-100 text-blue-700 border-blue-200',
  DISERTACION: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export default function CalendarioPage() {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    evaluacionesApi.listar()
      .then(res => setEvaluaciones(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getEvalForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return evaluaciones.filter(e => e.fecha === dateStr);
  };

  const listEventsForSelectedDate = () => {
    if (!selectedDate) return [];
    const day = selectedDate.getDate();
    return getEvalForDay(day);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Calendario Escolar</h1>
        <p className="text-sm text-gray-500 mt-1">Calendario de evaluaciones y eventos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-xl font-bold text-gray-800">
              {months[month]} {year}
            </h2>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {daysOfWeek.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-500 py-2">{d}</div>
            ))}

            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[80px] p-1" />
            ))}

            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const evals = getEvalForDay(day);
              const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === month;
              const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(new Date(year, month, day))}
                  className={`min-h-[80px] p-1 rounded-lg border transition-all duration-200 text-left
                    ${isSelected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300'}
                    ${isToday ? 'bg-blue-50' : 'bg-white'}
                  `}
                >
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs mb-1
                    ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700'}
                  `}>
                    {day}
                  </span>
                  <div className="space-y-0.5">
                    {evals.slice(0, 2).map(e => (
                      <div key={e.id} className={`px-1 py-0.5 rounded text-[9px] font-medium leading-tight border ${tipoColors[e.tipo] || 'bg-gray-100 border-gray-200'}`}>
                        {e.nombre?.slice(0, 15)}
                      </div>
                    ))}
                    {evals.length > 2 && (
                      <div className="text-[9px] text-gray-400 font-medium">+{evals.length - 2} más</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ClipboardList size={18} className="text-blue-600" />
            {selectedDate
              ? `Eventos - ${selectedDate.getDate()} de ${months[selectedDate.getMonth()]}`
              : 'Selecciona un día'}
          </h3>

          {selectedDate && (
            <div className="space-y-3">
              {listEventsForSelectedDate().map(e => (
                <div key={e.id} className={`p-3 rounded-xl border ${tipoColors[e.tipo] || 'bg-gray-50'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold">{e.tipo}</span>
                    <span className="text-xs opacity-75">{e.asignatura?.nombre || '—'}</span>
                  </div>
                  <p className="text-sm font-medium">{e.nombre}</p>
                </div>
              ))}
              {listEventsForSelectedDate().length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <CalendarDays size={40} className="mx-auto mb-2 text-gray-200" />
                  <p className="text-sm">Sin eventos</p>
                </div>
              )}
            </div>
          )}

          {!selectedDate && (
            <div className="text-center py-12 text-gray-400">
              <CalendarDays size={40} className="mx-auto mb-2 text-gray-200" />
              <p className="text-sm">Haz clic en un día para ver sus eventos</p>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Tipos</h4>
            <div className="space-y-1.5">
              {Object.entries(tipoColors).map(([tipo, colors]) => (
                <div key={tipo} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${colors.split(' ')[0]}`} />
                  <span className="text-xs text-gray-600">{tipo}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

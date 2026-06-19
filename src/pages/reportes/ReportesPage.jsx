import { useState, useEffect } from 'react';
import { notasApi, asistenciasApi, estudiantesApi, evaluacionesApi } from '../../api/endpoints';
import { FileBarChart, GraduationCap, CalendarCheck, TrendingUp, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RPieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#059669', '#dc2626', '#f59e0b', '#3b82f6'];

export default function ReportesPage() {
  const [notas, setNotas] = useState([]);
  const [asistencias, setAsistencias] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('general');

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Colegio Bernardo O\'Higgins', pageWidth / 2, y, { align: 'center' });
    y += 8;
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('Reporte Academico', pageWidth / 2, y, { align: 'center' });
    y += 6;
    doc.setFontSize(9);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-CL')}`, pageWidth / 2, y, { align: 'center' });
    y += 12;

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Resumen General', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Promedio General: ${promedioGeneral}`, 20, y); y += 6;
    doc.text(`Asistencia: ${porcentajeAsistencia}%`, 20, y); y += 6;
    doc.text(`Total Notas: ${notas.length}`, 20, y); y += 6;
    doc.text(`Aprobadas: ${notasAprobadas} | Reprobadas: ${notasReprobadas}`, 20, y); y += 10;

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Rendimiento por Estudiante', 20, y);
    y += 8;
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text('Estudiante', 20, y);
    doc.text('Promedio', 140, y);
    y += 5;
    doc.setFont(undefined, 'normal');
    for (const item of rendimientoData.slice(0, 20)) {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(item.nombre || '—', 20, y);
      doc.text(String(item.promedio), 140, y);
      y += 5;
    }
    y += 8;

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Distribucion de Asistencia', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    for (const stat of asistenciaStats) {
      doc.text(`${stat.name}: ${stat.value}`, 20, y);
      y += 6;
    }

    doc.save(`reporte-colegio-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  useEffect(() => {
    Promise.all([
      notasApi.listar(),
      asistenciasApi.listar(),
      estudiantesApi.listar(),
      evaluacionesApi.listar()
    ]).then(([nRes, aRes, eRes, evRes]) => {
      setNotas(nRes.data);
      setAsistencias(aRes.data);
      setEstudiantes(eRes.data);
      setEvaluaciones(evRes.data);
    }).catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  const getStudentName = (id) => {
    const s = estudiantes.find(s => s.id === id);
    return s ? `${s.nombre} ${s.apellido}` : `ID: ${id}`;
  };

  const rendimientoData = notas.reduce((acc, nota) => {
    const estId = nota.estudiante?.id || nota.estudiante;
    const existing = acc.find(a => a.estudianteId === estId);
    if (existing) {
      existing.total += nota.valor;
      existing.count += 1;
      existing.promedio = Number((existing.total / existing.count).toFixed(1));
    } else {
      acc.push({
        estudianteId: estId,
        nombre: getStudentName(estId),
        total: nota.valor,
        count: 1,
        promedio: nota.valor
      });
    }
    return acc;
  }, []).sort((a, b) => b.promedio - a.promedio);

  const asistenciaStats = asistencias.reduce((acc, a) => {
    const existing = acc.find(x => x.name === a.estado);
    if (existing) existing.value += 1;
    else acc.push({ name: a.estado, value: 1 });
    return acc;
  }, []);

  const totalAsistencias = asistencias.length;
  const presentes = asistencias.filter(a => a.estado === 'PRESENTE').length;
  const ausentes = asistencias.filter(a => a.estado === 'AUSENTE').length;
  const porcentajeAsistencia = totalAsistencias > 0 ? Math.round((presentes / totalAsistencias) * 100) : 0;

  const promedioGeneral = notas.length > 0
    ? Number((notas.reduce((sum, n) => sum + n.valor, 0) / notas.length).toFixed(1))
    : 0;

  const notasAprobadas = notas.filter(n => n.valor >= 4.0).length;
  const notasReprobadas = notas.filter(n => n.valor < 4.0).length;

  if (loading) return (
    <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Reportes</h1>
        <p className="text-sm text-gray-500 mt-1">Estadísticas y reportes académicos</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-2">
        {(['general', 'rendimiento', 'asistencia']).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${tab === t ? 'bg-blue-700 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
            {t === 'general' ? 'General' : t === 'rendimiento' ? 'Rendimiento' : 'Asistencia'}
          </button>
        ))}
        </div>
        <button onClick={handleExportPDF} className="btn-primary flex items-center gap-2 text-sm">
          <Download size={16} /> Exportar PDF
        </button>
      </div>

      {tab === 'general' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <TrendingUp size={20} className="text-emerald-600" />
                </div>
                <p className="text-sm text-gray-500">Promedio General</p>
              </div>
              <p className="text-3xl font-bold text-gray-800">{promedioGeneral}</p>
            </div>
            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <CalendarCheck size={20} className="text-blue-600" />
                </div>
                <p className="text-sm text-gray-500">Asistencia</p>
              </div>
              <p className="text-3xl font-bold text-gray-800">{porcentajeAsistencia}%</p>
            </div>
            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <GraduationCap size={20} className="text-purple-600" />
                </div>
                <p className="text-sm text-gray-500">Total Notas</p>
              </div>
              <p className="text-3xl font-bold text-gray-800">{notas.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">Distribución de Notas</h3>
              <ResponsiveContainer width="100%" height={250}>
                <RPieChart>
                  <Pie data={[
                    { name: 'Aprobadas (≥ 4.0)', value: notasAprobadas },
                    { name: 'Reprobadas (< 4.0)', value: notasReprobadas }
                  ]} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                    paddingAngle={5} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                    <Cell fill={COLORS[0]} />
                    <Cell fill={COLORS[1]} />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RPieChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">Distribución de Asistencia</h3>
              <ResponsiveContainer width="100%" height={250}>
                <RPieChart>
                  <Pie data={asistenciaStats} cx="50%" cy="50%" outerRadius={90}
                    paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                    {asistenciaStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {tab === 'rendimiento' && (
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Promedio por Estudiante</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={rendimientoData.slice(0, 20)} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" angle={-45} textAnchor="end" tick={{ fontSize: 11 }} />
              <YAxis domain={[1, 7]} />
              <Tooltip />
              <Bar dataKey="promedio" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                {rendimientoData.slice(0, 20).map((entry, i) => (
                  <Cell key={i} fill={entry?.promedio >= 4.0 ? '#059669' : '#dc2626'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {tab === 'asistencia' && (
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Resumen de Asistencia</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {asistenciaStats.map((a) => (
              <div key={a.name} className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold text-gray-800">{a.value}</p>
                <p className="text-xs text-gray-500 mt-1">{a.name}</p>
              </div>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={asistenciaStats} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {asistenciaStats.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

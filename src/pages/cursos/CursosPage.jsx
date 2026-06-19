import { useState, useEffect } from 'react';
import { estudiantesApi, asignaturasApi } from '../../api/endpoints';
import { School, GraduationCap, BookOpen } from 'lucide-react';

const cursos = [
  { nivel: 1, nombre: '1° Básico' }, { nivel: 2, nombre: '2° Básico' }, { nivel: 3, nombre: '3° Básico' },
  { nivel: 4, nombre: '4° Básico' }, { nivel: 5, nombre: '5° Básico' }, { nivel: 6, nombre: '6° Básico' },
  { nivel: 7, nombre: '7° Básico' }, { nivel: 8, nombre: '8° Básico' },
  { nivel: 9, nombre: '1° Medio' }, { nivel: 10, nombre: '2° Medio' }, { nivel: 11, nombre: '3° Medio' }, { nivel: 12, nombre: '4° Medio' },
];

export default function CursosPage() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCurso, setSelectedCurso] = useState(null);

  useEffect(() => {
    Promise.all([
      estudiantesApi.listar(),
      asignaturasApi.listar()
    ]).then(([estRes, asigRes]) => {
      setEstudiantes(estRes.data);
      setAsignaturas(asigRes.data);
    }).catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  const getEstudiantesByCurso = (curso) => estudiantes.filter(e => e.curso === curso);
  const getAsignaturasByCurso = (curso) => asignaturas.filter(a => a.nivelCurso === curso);

  const selectedData = selectedCurso ? {
    estudiantes: getEstudiantesByCurso(selectedCurso),
    asignaturas: getAsignaturasByCurso(selectedCurso)
  } : null;

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Cursos</h1>
        <p className="text-sm text-gray-500 mt-1">Gestión y visualización de cursos</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {cursos.map((curso) => {
          const count = getEstudiantesByCurso(curso.nivel).length;
          const asigCount = getAsignaturasByCurso(curso.nivel).length;
          return (
            <button
              key={curso.nivel}
              onClick={() => setSelectedCurso(selectedCurso === curso.nivel ? null : curso.nivel)}
              className={`card text-left transition-all duration-200 ${
                selectedCurso === curso.nivel ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <School size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{curso.nombre}</h3>
                  <p className="text-xs text-gray-400">{count} estudiantes</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><GraduationCap size={14} />{count}</span>
                <span className="flex items-center gap-1"><BookOpen size={14} />{asigCount} asig.</span>
              </div>
            </button>
          );
        })}
      </div>

      {selectedData && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <GraduationCap size={20} className="text-blue-600" />
              Estudiantes - {cursos.find(c => c.nivel === selectedCurso)?.nombre}
              <span className="badge-info ml-2">{selectedData.estudiantes.length}</span>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-header">RUT</th>
                    <th className="table-header">Nombre</th>
                    <th className="table-header">Apellido</th>
                    <th className="table-header">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedData.estudiantes.map(e => (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="table-cell font-medium">{e.rut}</td>
                      <td className="table-cell">{e.nombre}</td>
                      <td className="table-cell">{e.apellido}</td>
                      <td className="table-cell">{e.email || '—'}</td>
                    </tr>
                  ))}
                  {selectedData.estudiantes.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-8 text-gray-400">Sin estudiantes asignados</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BookOpen size={20} className="text-purple-600" />
              Asignaturas - {cursos.find(c => c.nivel === selectedCurso)?.nombre}
              <span className="badge-info ml-2">{selectedData.asignaturas.length}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedData.asignaturas.map(a => (
                <div key={a.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <p className="font-medium text-gray-800 text-sm">{a.nombre}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {a.profesor?.nombre || 'Sin profesor'} {a.profesor?.apellido || ''}
                  </p>
                </div>
              ))}
              {selectedData.asignaturas.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-400">Sin asignaturas para este nivel</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

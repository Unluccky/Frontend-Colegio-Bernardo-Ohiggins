import apiClient from './client';

// =========== ESTUDIANTES ===========
export const estudiantesApi = {
  listar: () => apiClient.get('/academico/api/estudiantes'),
  buscar: (id) => apiClient.get(`/academico/api/estudiantes/${id}`),
  buscarPorRut: (rut) => apiClient.get(`/academico/api/estudiantes/rut/${rut}`),
  crear: (data) => apiClient.post('/academico/api/estudiantes', data),
  actualizar: (id, data) => apiClient.put(`/academico/api/estudiantes/${id}`, data),
  eliminar: (id) => apiClient.delete(`/academico/api/estudiantes/${id}`),
};

// =========== PROFESORES ===========
export const profesoresApi = {
  listar: () => apiClient.get('/academico/api/profesores'),
  buscar: (id) => apiClient.get(`/academico/api/profesores/${id}`),
  crear: (data) => apiClient.post('/academico/api/profesores', data),
  actualizar: (id, data) => apiClient.put(`/academico/api/profesores/${id}`, data),
  eliminar: (id) => apiClient.delete(`/academico/api/profesores/${id}`),
};

// =========== APODERADOS ===========
export const apoderadosApi = {
  listar: () => apiClient.get('/academico/api/apoderados'),
  buscar: (id) => apiClient.get(`/academico/api/apoderados/${id}`),
  buscarPorRut: (rut) => apiClient.get(`/academico/api/apoderados/rut/${rut}`),
  buscarPorEstudiante: (estudianteId) => apiClient.get(`/academico/api/apoderados/estudiante/${estudianteId}`),
  crear: (data) => apiClient.post('/academico/api/apoderados', data),
  actualizar: (id, data) => apiClient.put(`/academico/api/apoderados/${id}`, data),
  eliminar: (id) => apiClient.delete(`/academico/api/apoderados/${id}`),
};

// =========== ASIGNATURAS ===========
export const asignaturasApi = {
  listar: () => apiClient.get('/academico/api/asignaturas'),
  buscar: (id) => apiClient.get(`/academico/api/asignaturas/${id}`),
  crear: (data) => apiClient.post('/academico/api/asignaturas', data),
  actualizar: (id, data) => apiClient.put(`/academico/api/asignaturas/${id}`, data),
  eliminar: (id) => apiClient.delete(`/academico/api/asignaturas/${id}`),
};

// =========== EVALUACIONES ===========
export const evaluacionesApi = {
  listar: () => apiClient.get('/academico/api/evaluaciones'),
  buscar: (id) => apiClient.get(`/academico/api/evaluaciones/${id}`),
  crear: (data) => apiClient.post('/academico/api/evaluaciones', data),
  actualizar: (id, data) => apiClient.put(`/academico/api/evaluaciones/${id}`, data),
  eliminar: (id) => apiClient.delete(`/academico/api/evaluaciones/${id}`),
};

// =========== NOTAS ===========
export const notasApi = {
  listar: () => apiClient.get('/academico/api/notas'),
  buscar: (id) => apiClient.get(`/academico/api/notas/${id}`),
  buscarPorEstudiante: (estudianteId) => apiClient.get(`/academico/api/notas/estudiante/${estudianteId}`),
  crear: (data) => apiClient.post('/academico/api/notas', data),
  eliminar: (id) => apiClient.delete(`/academico/api/notas/${id}`),
};

// =========== ASISTENCIAS ===========
export const asistenciasApi = {
  listar: () => apiClient.get('/asistencia/api/asistencias'),
  buscar: (id) => apiClient.get(`/asistencia/api/asistencias/${id}`),
  buscarPorEstudiante: (estudianteId) => apiClient.get(`/asistencia/api/asistencias/estudiante/${estudianteId}`),
  buscarPorClase: (asignaturaId, fecha) => apiClient.get(`/asistencia/api/asistencias/por-clase?asignaturaId=${asignaturaId}&fecha=${fecha}`),
  crear: (data) => apiClient.post('/asistencia/api/asistencias', data),
  crearBatch: (data) => apiClient.post('/asistencia/api/asistencias/batch', data),
  actualizar: (id, data) => apiClient.put(`/asistencia/api/asistencias/${id}`, data),
  eliminar: (id) => apiClient.delete(`/asistencia/api/asistencias/${id}`),
};

// =========== ANOTACIONES ===========
export const anotacionesApi = {
  listar: () => apiClient.get('/asistencia/api/anotaciones'),
  buscar: (id) => apiClient.get(`/asistencia/api/anotaciones/${id}`),
  buscarPorEstudiante: (estudianteId) => apiClient.get(`/asistencia/api/anotaciones/estudiante/${estudianteId}`),
  crear: (data) => apiClient.post('/asistencia/api/anotaciones', data),
  actualizar: (id, data) => apiClient.put(`/asistencia/api/anotaciones/${id}`, data),
  eliminar: (id) => apiClient.delete(`/asistencia/api/anotaciones/${id}`),
};

// =========== MENSAJES ===========
export const mensajesApi = {
  listar: () => apiClient.get('/comunicaciones/api/mensajes'),
  buscar: (id) => apiClient.get(`/comunicaciones/api/mensajes/${id}`),
  buscarPorDestinatario: (destinatarioId) => apiClient.get(`/comunicaciones/api/mensajes/destinatario/${destinatarioId}`),
  buscarPorUsuario: (usuarioId, tipo) => apiClient.get(`/comunicaciones/api/mensajes/usuario/${usuarioId}?tipo=${tipo}`),
  enviar: (data) => apiClient.post('/comunicaciones/api/mensajes', data),
  actualizar: (id, data) => apiClient.put(`/comunicaciones/api/mensajes/${id}`, data),
  eliminar: (id) => apiClient.delete(`/comunicaciones/api/mensajes/${id}`),
};

// =========== HORARIOS ===========
export const horariosApi = {
  listar: () => apiClient.get('/academico/api/horarios'),
  buscar: (id) => apiClient.get(`/academico/api/horarios/${id}`),
  buscarPorCurso: (curso) => apiClient.get(`/academico/api/horarios/curso/${curso}`),
  buscarPorProfesor: (profesorId) => apiClient.get(`/academico/api/horarios/profesor/${profesorId}`),
  buscarPorCursoYDia: (curso, dia) => apiClient.get(`/academico/api/horarios/curso/${curso}/dia/${dia}`),
  crear: (data) => apiClient.post('/academico/api/horarios', data),
  actualizar: (id, data) => apiClient.put(`/academico/api/horarios/${id}`, data),
  eliminar: (id) => apiClient.delete(`/academico/api/horarios/${id}`),
};

// =========== USUARIOS UTP ===========
export const usuariosUtpApi = {
  listar: () => apiClient.get('/admin/usuarios-utp'),
  crear: (data) => apiClient.post('/admin/usuarios-utp', data),
  eliminar: (rut) => apiClient.delete(`/admin/usuarios-utp/${rut}`),
};

// =========== NOTIFICACIONES ===========
export const notificacionesApi = {
  listar: () => apiClient.get('/comunicaciones/api/notificaciones'),
  buscar: (id) => apiClient.get(`/comunicaciones/api/notificaciones/${id}`),
  buscarPorDestinatario: (destinatarioId) => apiClient.get(`/comunicaciones/api/notificaciones/destinatario/${destinatarioId}`),
  crear: (data) => apiClient.post('/comunicaciones/api/notificaciones', data),
  eliminar: (id) => apiClient.delete(`/comunicaciones/api/notificaciones/${id}`),
};

import apiClient from './client';

export async function login(data) {
  const response = await apiClient.post('/auth/login', data);
  return response.data;
}

export async function cambiarContrasena(data) {
  const response = await apiClient.post('/auth/cambiar-contrasena', data);
  return response.data;
}

export async function resetearContrasena(data) {
  const response = await apiClient.post('/auth/resetear-contrasena', data);
  return response.data;
}

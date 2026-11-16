import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Login from './Login';

const mocks = vi.hoisted(() => ({
  loginApi: vi.fn(),
  authLogin: vi.fn(),
}));

vi.mock('../api/auth', () => ({ login: mocks.loginApi }));
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ login: mocks.authLogin, isAuthenticated: false }),
}));

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<h1>Panel principal</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Login', () => {
  beforeEach(() => vi.clearAllMocks());

  it('envía RUT y contraseña, crea la sesión y navega al panel', async () => {
    mocks.loginApi.mockResolvedValue({ token: 'token-test', rut: '12345678-9', role: 'UTP' });
    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('12.345.678-9'), { target: { value: '12345678-9' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'clave-test' } });
    fireEvent.click(screen.getByRole('button', { name: /Ingresar/i }));

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Panel principal' })).toBeInTheDocument());
    expect(mocks.loginApi).toHaveBeenCalledWith({ rut: '12345678-9', password: 'clave-test' });
    expect(mocks.authLogin).toHaveBeenCalledWith({ token: 'token-test', rut: '12345678-9', role: 'UTP' });
  });

  it('muestra un error comprensible si las credenciales son rechazadas', async () => {
    mocks.loginApi.mockRejectedValue({ response: { status: 401 } });
    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('12.345.678-9'), { target: { value: '12345678-9' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'incorrecta' } });
    fireEvent.click(screen.getByRole('button', { name: /Ingresar/i }));

    expect(await screen.findByText(/RUT o contraseña incorrectos/i)).toBeInTheDocument();
    expect(mocks.authLogin).not.toHaveBeenCalled();
  });
});

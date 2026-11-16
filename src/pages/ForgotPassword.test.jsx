import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import ForgotPassword from './ForgotPassword';

describe('ForgotPassword', () => {
  it('directs users to UTP rather than allowing password changes by RUT alone', () => {
    render(
      <MemoryRouter initialEntries={['/olvide-mi-contrasena']}>
        <Routes>
          <Route path="/olvide-mi-contrasena" element={<ForgotPassword />} />
          <Route path="/login" element={<h1>Iniciar sesión</h1>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText(/Por seguridad, el sistema no permite restablecer una contraseña usando solo el RUT/i))
      .toBeInTheDocument();
    expect(screen.queryByLabelText('RUT')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Nueva contraseña')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Volver a iniciar sesión/i }));
    expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();
  });
});

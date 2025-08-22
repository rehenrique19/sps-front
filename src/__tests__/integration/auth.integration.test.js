import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../src/contexts/AuthContext';
import { ThemeProvider } from '../../src/contexts/ThemeContext';
import SignIn from '../../src/pages/SignIn';
import ApiService from '../../src/services/ApiService';

// Mock do ApiService
jest.mock('../../src/services/ApiService');

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          {component}
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('Auth Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('should complete login flow successfully', async () => {
    const mockResponse = {
      token: 'mock-jwt-token',
      user: {
        id: 1,
        email: 'admin@spsgroup.com.br',
        name: 'Admin User',
        type: 'super_admin'
      }
    };

    ApiService.post.mockResolvedValue(mockResponse);

    renderWithProviders(<SignIn />);

    // Preencher formulário
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'admin@spsgroup.com.br' }
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: '1234' }
    });

    // Submeter formulário
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    // Verificar chamada da API
    await waitFor(() => {
      expect(ApiService.post).toHaveBeenCalledWith('/auth/login', {
        email: 'admin@spsgroup.com.br',
        password: '1234'
      });
    });

    // Verificar armazenamento do token
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'mock-jwt-token');
  });

  test('should handle login error', async () => {
    ApiService.post.mockRejectedValue(new Error('Credenciais inválidas'));

    renderWithProviders(<SignIn />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'invalid@email.com' }
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'wrong' }
    });

    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/credenciais inválidas/i)).toBeInTheDocument();
    });
  });
});
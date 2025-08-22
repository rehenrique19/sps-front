import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../src/contexts/AuthContext';
import { ThemeProvider } from '../../src/contexts/ThemeContext';
import Layout from '../../src/components/Layout';
import Routes from '../../src/routes';

const mockAuthContext = {
  user: {
    id: 1,
    email: 'admin@spsgroup.com.br',
    name: 'Admin User',
    type: 'super_admin'
  },
  token: 'mock-token',
  isAuthenticated: true,
  logout: jest.fn()
};

jest.mock('../../src/contexts/AuthContext', () => ({
  ...jest.requireActual('../../src/contexts/AuthContext'),
  useAuth: () => mockAuthContext
}));

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

describe('Navigation Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should navigate between pages correctly', async () => {
    renderWithProviders(
      <Layout>
        <Routes />
      </Layout>
    );

    // Verificar se está na página inicial
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();

    // Navegar para usuários
    const usersLink = screen.getByText(/usuários/i);
    fireEvent.click(usersLink);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/users');
    });
  });

  test('should handle logout correctly', async () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Abrir menu do usuário
    const userMenuButton = screen.getByText(/admin user/i);
    fireEvent.click(userMenuButton);

    // Clicar em logout
    const logoutButton = screen.getByText(/sair/i);
    fireEvent.click(logoutButton);

    expect(mockAuthContext.logout).toHaveBeenCalled();
  });

  test('should toggle theme correctly', async () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Encontrar botão de tema
    const themeToggle = screen.getByRole('button', { name: /tema/i });
    fireEvent.click(themeToggle);

    // Verificar se o tema foi alterado
    await waitFor(() => {
      expect(document.body.classList.contains('dark-theme')).toBeTruthy();
    });
  });

  test('should show user menu with correct permissions', async () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Verificar se o menu lateral mostra opções corretas para super_admin
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/usuários/i)).toBeInTheDocument();
    
    // Super admin deve ver todas as opções
    expect(screen.getByText(/admin user/i)).toBeInTheDocument();
  });
});
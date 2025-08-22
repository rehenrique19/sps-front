import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../src/contexts/AuthContext';
import { ThemeProvider } from '../../../src/contexts/ThemeContext';
import SideNav from '../../../src/components/SideNav';

const mockAuthContext = {
  user: {
    id: 1,
    email: 'admin@spsgroup.com.br',
    name: 'Admin User',
    type: 'super_admin'
  },
  isAuthenticated: true
};

jest.mock('../../../src/contexts/AuthContext', () => ({
  ...jest.requireActual('../../../src/contexts/AuthContext'),
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

describe('SideNav Component', () => {
  test('should render navigation items', () => {
    renderWithProviders(<SideNav />);

    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/usuários/i)).toBeInTheDocument();
  });

  test('should show correct items for super_admin', () => {
    renderWithProviders(<SideNav />);

    // Super admin deve ver todas as opções
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/usuários/i)).toBeInTheDocument();
  });

  test('should handle navigation clicks', () => {
    renderWithProviders(<SideNav />);

    const usersLink = screen.getByText(/usuários/i);
    fireEvent.click(usersLink);

    // Verificar se a navegação foi acionada
    expect(usersLink.closest('a')).toHaveAttribute('href', '/users');
  });
});
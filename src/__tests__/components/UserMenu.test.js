import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../src/contexts/AuthContext';
import { ThemeProvider } from '../../../src/contexts/ThemeContext';
import UserMenu from '../../../src/components/UserMenu';

const mockAuthContext = {
  user: {
    id: 1,
    email: 'admin@spsgroup.com.br',
    name: 'Admin User',
    type: 'super_admin'
  },
  isAuthenticated: true,
  logout: jest.fn()
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

describe('UserMenu Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render user information', () => {
    renderWithProviders(<UserMenu />);

    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('admin@spsgroup.com.br')).toBeInTheDocument();
  });

  test('should show user type badge', () => {
    renderWithProviders(<UserMenu />);

    expect(screen.getByText('Super Admin')).toBeInTheDocument();
  });

  test('should handle logout click', () => {
    renderWithProviders(<UserMenu />);

    const logoutButton = screen.getByText(/sair/i);
    fireEvent.click(logoutButton);

    expect(mockAuthContext.logout).toHaveBeenCalled();
  });

  test('should toggle menu visibility', () => {
    renderWithProviders(<UserMenu />);

    const menuButton = screen.getByRole('button');
    fireEvent.click(menuButton);

    // Menu deve estar visível após o clique
    expect(screen.getByText(/sair/i)).toBeInTheDocument();
  });
});
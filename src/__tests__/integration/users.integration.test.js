import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../src/contexts/AuthContext';
import { ThemeProvider } from '../../src/contexts/ThemeContext';
import Users from '../../src/pages/Users';
import UserForm from '../../src/pages/UserForm';
import UserService from '../../src/services/UserService';

// Mock do UserService
jest.mock('../../src/services/UserService');

const mockAuthContext = {
  user: {
    id: 1,
    email: 'admin@spsgroup.com.br',
    name: 'Admin User',
    type: 'super_admin'
  },
  token: 'mock-token',
  isAuthenticated: true
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

describe('Users Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should load and display users list', async () => {
    const mockUsers = [
      {
        id: 1,
        email: 'admin@spsgroup.com.br',
        name: 'Admin User',
        type: 'super_admin'
      },
      {
        id: 2,
        email: 'user@spsgroup.com.br',
        name: 'Regular User',
        type: 'user'
      }
    ];

    UserService.getAll.mockResolvedValue(mockUsers);

    renderWithProviders(<Users />);

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument();
      expect(screen.getByText('Regular User')).toBeInTheDocument();
    });

    expect(UserService.getAll).toHaveBeenCalled();
  });

  test('should create new user successfully', async () => {
    const mockUser = {
      id: 3,
      email: 'newuser@spsgroup.com.br',
      name: 'New User',
      type: 'user'
    };

    UserService.create.mockResolvedValue(mockUser);

    renderWithProviders(<UserForm />);

    // Preencher formulário
    fireEvent.change(screen.getByLabelText(/nome/i), {
      target: { value: 'New User' }
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'newuser@spsgroup.com.br' }
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: '1234' }
    });
    fireEvent.change(screen.getByLabelText(/tipo/i), {
      target: { value: 'user' }
    });

    // Submeter formulário
    fireEvent.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() => {
      expect(UserService.create).toHaveBeenCalledWith({
        name: 'New User',
        email: 'newuser@spsgroup.com.br',
        password: '1234',
        type: 'user'
      });
    });
  });

  test('should handle user creation error', async () => {
    UserService.create.mockRejectedValue(new Error('Email já existe'));

    renderWithProviders(<UserForm />);

    fireEvent.change(screen.getByLabelText(/nome/i), {
      target: { value: 'Test User' }
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'existing@email.com' }
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: '1234' }
    });

    fireEvent.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() => {
      expect(screen.getByText(/email já existe/i)).toBeInTheDocument();
    });
  });
});
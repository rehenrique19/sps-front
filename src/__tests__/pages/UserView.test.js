import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UserView from '../../pages/UserView';
import { AuthProvider } from '../../contexts/AuthContext';
import { ThemeProvider } from '../../contexts/ThemeContext';

// Mock do UserService
jest.mock('../../services/UserService', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    delete: jest.fn()
  }));
});

// Mock do react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ userId: '1' })
}));

const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@test.com',
  type: 'user',
  avatar: null
};

const mockCurrentUser = {
  id: 2,
  name: 'Admin',
  email: 'admin@test.com',
  type: 'admin'
};

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          {component}
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('UserView', () => {
  let mockUserService;

  beforeEach(() => {
    const UserService = require('../../services/UserService');
    mockUserService = new UserService();
    mockUserService.get.mockResolvedValue(mockUser);
    mockUserService.delete.mockResolvedValue();
  });

  it('deve renderizar loading inicialmente', () => {
    renderWithProviders(<UserView />);
    expect(screen.getByText('Carregando usuário...')).toBeInTheDocument();
  });

  it('deve renderizar dados do usuário', async () => {
    renderWithProviders(<UserView />);
    
    await waitFor(() => {
      expect(screen.getByText('Detalhes do Usuário')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@test.com')).toBeInTheDocument();
    });
  });

  it('deve renderizar erro quando falha ao carregar', async () => {
    mockUserService.get.mockRejectedValue(new Error('Erro'));
    
    renderWithProviders(<UserView />);
    
    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar usuário')).toBeInTheDocument();
    });
  });

  it('deve renderizar usuário não encontrado', async () => {
    mockUserService.get.mockResolvedValue(null);
    
    renderWithProviders(<UserView />);
    
    await waitFor(() => {
      expect(screen.getByText('Usuário não encontrado.')).toBeInTheDocument();
    });
  });

  it('deve renderizar avatar com iniciais quando não há imagem', async () => {
    renderWithProviders(<UserView />);
    
    await waitFor(() => {
      expect(screen.getByText('T')).toBeInTheDocument(); // Primeira letra do nome
    });
  });

  it('deve renderizar tipo de usuário correto', async () => {
    const adminUser = { ...mockUser, type: 'admin' };
    mockUserService.get.mockResolvedValue(adminUser);
    
    renderWithProviders(<UserView />);
    
    await waitFor(() => {
      expect(screen.getByText('Administrador')).toBeInTheDocument();
    });
  });

  it('deve chamar delete quando confirmar exclusão', async () => {
    window.confirm = jest.fn().mockReturnValue(true);
    
    renderWithProviders(<UserView />);
    
    await waitFor(() => {
      const deleteButton = screen.getByText('Excluir');
      fireEvent.click(deleteButton);
    });

    expect(mockUserService.delete).toHaveBeenCalledWith('1');
    expect(mockNavigate).toHaveBeenCalledWith('/users');
  });

  it('não deve deletar quando cancelar confirmação', async () => {
    window.confirm = jest.fn().mockReturnValue(false);
    
    renderWithProviders(<UserView />);
    
    await waitFor(() => {
      const deleteButton = screen.getByText('Excluir');
      fireEvent.click(deleteButton);
    });

    expect(mockUserService.delete).not.toHaveBeenCalled();
  });
});
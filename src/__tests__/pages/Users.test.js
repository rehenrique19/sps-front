import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Users from '../../pages/Users';
import { AuthProvider } from '../../contexts/AuthContext';
import { ThemeProvider } from '../../contexts/ThemeContext';

// Mock do UserService
jest.mock('../../services/UserService', () => {
  return jest.fn().mockImplementation(() => ({
    list: jest.fn(),
    delete: jest.fn()
  }));
});

const mockUsers = [
  { id: 1, name: 'Admin', email: 'admin@test.com', type: 'admin' },
  { id: 2, name: 'User', email: 'user@test.com', type: 'user' }
];

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

describe('Users', () => {
  let mockUserService;

  beforeEach(() => {
    const UserService = require('../../services/UserService');
    mockUserService = new UserService();
    mockUserService.list.mockResolvedValue(mockUsers);
    mockUserService.delete.mockResolvedValue();
  });

  it('deve renderizar loading inicialmente', () => {
    renderWithProviders(<Users />);
    expect(screen.getByText('Carregando usuários...')).toBeInTheDocument();
  });

  it('deve renderizar lista de usuários', async () => {
    renderWithProviders(<Users />);
    
    await waitFor(() => {
      expect(screen.getByText('Lista de Usuários')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('User')).toBeInTheDocument();
    });
  });

  it('deve renderizar erro quando falha ao carregar', async () => {
    mockUserService.list.mockRejectedValue(new Error('Erro'));
    
    renderWithProviders(<Users />);
    
    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar usuários. Tente novamente.')).toBeInTheDocument();
    });
  });

  it('deve renderizar mensagem quando não há usuários', async () => {
    mockUserService.list.mockResolvedValue([]);
    
    renderWithProviders(<Users />);
    
    await waitFor(() => {
      expect(screen.getByText('Nenhum usuário encontrado.')).toBeInTheDocument();
    });
  });

  it('deve renderizar badges de tipo de usuário', async () => {
    renderWithProviders(<Users />);
    
    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('Usuário')).toBeInTheDocument();
    });
  });

  it('deve chamar delete quando confirmar exclusão', async () => {
    window.confirm = jest.fn().mockReturnValue(true);
    
    renderWithProviders(<Users />);
    
    await waitFor(() => {
      const deleteButtons = screen.getAllByText('Excluir');
      fireEvent.click(deleteButtons[0]);
    });

    expect(mockUserService.delete).toHaveBeenCalled();
  });

  it('não deve deletar quando cancelar confirmação', async () => {
    window.confirm = jest.fn().mockReturnValue(false);
    
    renderWithProviders(<Users />);
    
    await waitFor(() => {
      const deleteButtons = screen.getAllByText('Excluir');
      fireEvent.click(deleteButtons[0]);
    });

    expect(mockUserService.delete).not.toHaveBeenCalled();
  });

  it('deve renderizar botão novo usuário para admins', async () => {
    renderWithProviders(<Users />);
    
    await waitFor(() => {
      expect(screen.getByText('+ Novo Usuário')).toBeInTheDocument();
    });
  });
});
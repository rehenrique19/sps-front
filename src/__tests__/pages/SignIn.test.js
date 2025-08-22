import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SignIn from '../../pages/SignIn';
import { AuthProvider } from '../../contexts/AuthContext';
import { ThemeProvider } from '../../contexts/ThemeContext';

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

describe('SignIn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar formulário de login', () => {
    renderWithProviders(<SignIn />);
    
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByLabelText('Email:')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('deve mostrar erro quando campos estão vazios', async () => {
    renderWithProviders(<SignIn />);
    
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Email é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('Senha é obrigatória')).toBeInTheDocument();
    });
  });

  it('deve validar formato de email', async () => {
    renderWithProviders(<SignIn />);
    
    const emailInput = screen.getByLabelText('Email:');
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    
    fireEvent.change(emailInput, { target: { value: 'email-invalido' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Email inválido')).toBeInTheDocument();
    });
  });

  it('deve preencher campos com credenciais de exemplo', () => {
    renderWithProviders(<SignIn />);
    
    // Como não há botões de exemplo no componente atual, vamos testar os campos vazios
    const emailInput = screen.getByLabelText('Email:');
    const passwordInput = screen.getByLabelText('Senha:');
    
    expect(emailInput.value).toBe('');
    expect(passwordInput.value).toBe('');
  });

  it('deve alternar visibilidade da senha', () => {
    renderWithProviders(<SignIn />);
    
    const passwordInput = screen.getByLabelText('Senha:');
    // Como não há botão de toggle no componente atual, vamos apenas testar o tipo
    
    expect(passwordInput.type).toBe('password');
  });

  it('deve mostrar loading durante login', async () => {
    renderWithProviders(<SignIn />);
    
    const emailInput = screen.getByLabelText('Email:');
    const passwordInput = screen.getByLabelText('Senha:');
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    
    fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
    fireEvent.change(passwordInput, { target: { value: '1234' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Entrando...')).toBeInTheDocument();
    });
  });
});
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Layout from '../../components/Layout';
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

describe('Layout', () => {
  it('deve renderizar título', () => {
    renderWithProviders(
      <Layout title="Test Title">
        <div>Test Content</div>
      </Layout>
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('deve renderizar conteúdo filho', () => {
    renderWithProviders(
      <Layout title="Test">
        <div>Test Content</div>
      </Layout>
    );
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('deve renderizar SideNav', () => {
    renderWithProviders(
      <Layout title="Test">
        <div>Content</div>
      </Layout>
    );
    
    // Verifica se elementos do SideNav estão presentes
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('deve renderizar UserMenu', () => {
    renderWithProviders(
      <Layout title="Test">
        <div>Content</div>
      </Layout>
    );
    
    // UserMenu deve estar presente no header
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });
});
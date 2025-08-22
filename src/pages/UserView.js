import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import UserService from '../services/UserService';
import Layout from '../components/Layout';

function UserView() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user: currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const userService = new UserService();

  useEffect(() => {
    loadUser();
  }, [userId]);

  const loadUser = async () => {
    try {
      const userData = await userService.get(userId);
      setUser(userData);
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      setError('Erro ao carregar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const isOwnAccount = parseInt(userId) === currentUser?.id;
    const confirmMessage = isOwnAccount 
      ? `ATENÇÃO: Você está prestes a excluir sua própria conta!\n\nIsso fará com que você seja deslogado imediatamente e não poderá mais acessar o sistema.\n\nTem certeza que deseja continuar?`
      : `Tem certeza que deseja excluir este usuário?`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await userService.delete(userId);
        
        if (isOwnAccount) {
          logout();
        } else {
          navigate('/users');
        }
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        setError('Erro ao excluir usuário');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh',
        fontSize: '18px',
        backgroundColor: theme.colors.background,
        color: theme.colors.text
      }}>
        Carregando usuário...
      </div>
    );
  }

  return (
    <Layout title="Visualizar Usuário">
      <div>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {/* Breadcrumb */}
          <nav style={{ marginBottom: '1.5rem' }}>
            <Link to="/users" style={{ color: theme.colors.primary, textDecoration: 'none' }}>
              ← Voltar para Lista de Usuários
            </Link>
          </nav>

          <div style={{ 
            backgroundColor: theme.colors.surface,
            borderRadius: '8px',
            padding: '2rem',
            boxShadow: theme.isDark ? '0 2px 4px rgba(255,255,255,0.1)' : '0 2px 4px rgba(0,0,0,0.1)',
            border: `1px solid ${theme.colors.border}`
          }}>
            {error ? (
              <div style={{
                color: theme.colors.danger,
                backgroundColor: theme.isDark ? 'rgba(220, 53, 69, 0.1)' : '#f8d7da',
                border: `1px solid ${theme.colors.danger}`,
                borderRadius: '4px',
                padding: '0.75rem',
                marginBottom: '1.5rem'
              }}>
                {error}
              </div>
            ) : user ? (
              <>
                <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: theme.colors.text }}>
                  Detalhes do Usuário
                </h2>
                
                {/* Avatar */}
                <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                  <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    backgroundColor: user.avatar ? 'transparent' : theme.colors.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    overflow: 'hidden',
                    border: `3px solid ${theme.colors.border}`,
                    boxShadow: theme.isDark ? '0 4px 8px rgba(255,255,255,0.1)' : '0 4px 8px rgba(0,0,0,0.1)'
                  }}>
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt="Avatar do usuário" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: user.avatar ? 'none' : 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '48px',
                      fontWeight: 'bold'
                    }}>
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  </div>
                </div>
                
                <div style={{ marginBottom: '1rem', color: theme.colors.text }}>
                  <strong>Nome:</strong> {user.name}
                </div>
                
                <div style={{ marginBottom: '1rem', color: theme.colors.text }}>
                  <strong>Email:</strong> {user.email}
                </div>
                
                <div style={{ marginBottom: '2rem', color: theme.colors.text }}>
                  <strong>Tipo:</strong> 
                  <span style={{
                    marginLeft: '8px',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: user.type === 'super_admin' ? '#6f42c1' : user.type === 'admin' ? '#dc3545' : '#28a745',
                    color: 'white'
                  }}>
                    {user.type === 'super_admin' ? 'Super Administrador' : user.type === 'admin' ? 'Administrador' : 'Usuário'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  {((currentUser?.type === 'admin' || currentUser?.type === 'super_admin') || parseInt(userId) === currentUser?.id) && (
                    <Link
                      to={`/users/${userId}/edit`}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: theme.colors.primary,
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontSize: '16px'
                      }}
                    >
                      Editar
                    </Link>
                  )}
                  {(currentUser?.type === 'admin' || currentUser?.type === 'super_admin') && user?.type !== 'super_admin' && (
                    <button
                      onClick={handleDelete}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: theme.colors.danger,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '16px'
                      }}
                    >
                      Excluir
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: theme.colors.textSecondary }}>
                Usuário não encontrado.
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default UserView;
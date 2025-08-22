import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import UserService from "../services/UserService";
import Layout from "../components/Layout";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user: currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const userService = new UserService();

  const loadUsers = useCallback(async () => {
    try {
      setError('');
      const users = await userService.list();
      setUsers(users);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setError('Erro ao carregar usuários. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleDelete = async (id, userName) => {
    const isOwnAccount = id === currentUser?.id;
    const confirmMessage = isOwnAccount 
      ? `ATENÇÃO: Você está prestes a excluir sua própria conta "${userName}"!\n\nIsso fará com que você seja deslogado imediatamente e não poderá mais acessar o sistema.\n\nTem certeza que deseja continuar?`
      : `Tem certeza que deseja excluir o usuário "${userName}"?`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await userService.delete(id);
        
        if (isOwnAccount) {
          logout();
        } else {
          setUsers(users.filter(user => user.id !== id));
        }
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        setError('Erro ao excluir usuário. Tente novamente.');
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
        fontSize: '18px'
      }}>
        Carregando usuários...
      </div>
    );
  }

  return (
    <Layout title="Gerenciamento de Usuários">
      <div>
        <div style={{ 
          backgroundColor: theme.colors.surface,
          borderRadius: '8px',
          padding: '1.5rem',
          boxShadow: theme.isDark ? '0 2px 4px rgba(255,255,255,0.1)' : '0 2px 4px rgba(0,0,0,0.1)',
          border: `1px solid ${theme.colors.border}`
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '1.5rem' 
          }}>
            <h2 style={{ margin: 0, color: theme.colors.text }}>Lista de Usuários</h2>
            {(currentUser?.type === 'admin' || currentUser?.type === 'super_admin') && (
              <Link 
                to="/users/new" 
                style={{ 
                  padding: '10px 20px',
                  backgroundColor: theme.colors.success,
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontWeight: 'bold'
                }}
              >
                + Novo Usuário
              </Link>
            )}
          </div>

          {error && (
            <div style={{
              color: theme.colors.danger,
              backgroundColor: theme.isDark ? 'rgba(220, 53, 69, 0.1)' : '#f8d7da',
              border: `1px solid ${theme.colors.danger}`,
              borderRadius: '4px',
              padding: '0.75rem',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}
          
          {!users || users.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem',
              color: theme.colors.textSecondary
            }}>
              Nenhum usuário encontrado.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'separate',
                borderSpacing: '0',
                backgroundColor: theme.colors.surface,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <thead>
                  <tr style={{ backgroundColor: theme.isDark ? '#34495e' : '#f8f9fa' }}>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'left', 
                      border: `1px solid ${theme.colors.border}`,
                      fontWeight: 'bold',
                      color: theme.colors.text
                    }}>Nome</th>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'left', 
                      border: `1px solid ${theme.colors.border}`,
                      fontWeight: 'bold',
                      color: theme.colors.text
                    }}>Email</th>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'left', 
                      border: `1px solid ${theme.colors.border}`,
                      fontWeight: 'bold',
                      color: theme.colors.text
                    }}>Tipo</th>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'center', 
                      border: `1px solid ${theme.colors.border}`,
                      fontWeight: 'bold',
                      width: '180px',
                      color: theme.colors.text
                    }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users && users.map(user => (
                    <tr key={user.id}>
                      <td style={{ 
                        padding: '12px', 
                        border: `1px solid ${theme.colors.border}`, 
                        color: theme.colors.text
                      }}>
                        {user.name}
                      </td>
                      <td style={{ 
                        padding: '12px', 
                        border: `1px solid ${theme.colors.border}`, 
                        color: theme.colors.text
                      }}>
                        {user.email}
                      </td>
                      <td style={{ 
                        padding: '12px', 
                        border: `1px solid ${theme.colors.border}`
                      }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          backgroundColor: user.type === 'super_admin' ? '#6f42c1' : user.type === 'admin' ? '#dc3545' : '#28a745',
                          color: 'white'
                        }}>
                          {user.type === 'super_admin' ? 'Super Admin' : user.type === 'admin' ? 'Admin' : 'Usuário'}
                        </span>
                      </td>
                      <td style={{ 
                        padding: '12px', 
                        border: `1px solid ${theme.colors.border}`,
                        textAlign: 'center'
                      }}>
                        <Link 
                          to={`/users/${user.id}`} 
                          style={{ 
                            marginRight: '4px',
                            padding: '4px 8px',
                            backgroundColor: '#17a2b8',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}
                        >
                          Ver
                        </Link>
                        {((currentUser?.type === 'admin' || currentUser?.type === 'super_admin') || user.id === currentUser?.id) && (
                          <Link 
                            to={`/users/${user.id}/edit`} 
                            style={{ 
                              marginRight: '4px',
                              padding: '4px 8px',
                              backgroundColor: '#007bff',
                              color: 'white',
                              textDecoration: 'none',
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}
                          >
                            Editar
                          </Link>
                        )}
                        {(currentUser?.type === 'admin' || currentUser?.type === 'super_admin') && user.type !== 'super_admin' && (
                          <button 
                            onClick={() => handleDelete(user.id, user.name)} 
                            style={{ 
                              padding: '4px 8px',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Excluir
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Users;

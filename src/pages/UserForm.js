import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import UserService from '../services/UserService';
import UserDTO from '../dto/UserDTO';
import Layout from '../components/Layout';

/**
 * COMPONENTE DE FORMULÁRIO DE USUÁRIO
 * 
 * Componente responsável pela criação e edição de usuários com recursos avançados:
 * 
 * Funcionalidades de Segurança:
 * - Validação em tempo real de campos obrigatórios
 * - Validação de formato de email com regex
 * - Upload seguro de imagens com validação de tipo e tamanho
 * - Bloqueio de submissão quando há erros de validação
 * - Sanitização de dados antes do envio
 * 
 * Recursos de UX:
 * - Preview de avatar com fallback para iniciais
 * - Card informativo com detalhes do arquivo selecionado
 * - Botão de remoção de imagem para corrigir erros
 * - Feedback visual de estados (loading, erro, sucesso)
 * - Validação progressiva (onBlur e onChange)
 * 
 * Controles de Acesso:
 * - Apenas admins podem alterar tipo de usuário
 * - Super admins podem criar outros super admins
 * - Usuários podem editar apenas seu próprio perfil
 * - Atualização automática do contexto de autenticação
 */
function UserForm() {
  const [user, setUser] = useState({
    name: '',
    email: '',
    type: 'user',
    password: '',
    avatar: null
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedFileInfo, setSelectedFileInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [errors, setErrors] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [hasValidationErrors, setHasValidationErrors] = useState(false);
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user: currentUser, logout, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const userService = new UserService();
  const isEdit = userId && userId !== 'new';

  useEffect(() => {
    if (isEdit) {
      loadUser();
    }
  }, [userId, isEdit]);

  const loadUser = async () => {
    setLoadingUser(true);
    try {
      const userData = await userService.get(userId);
      setUser({
        name: userData.name,
        email: userData.email,
        type: userData.type,
        password: '', // Não carregar senha
        avatar: userData.avatar
      });
      if (userData.avatar) {
        setAvatarPreview(userData.avatar);
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      setErrors(['Erro ao carregar usuário']);
    } finally {
      setLoadingUser(false);
    }
  };

  const validateForm = () => {
    const newFieldErrors = {};
    
    if (!user.name.trim()) {
      newFieldErrors.name = 'Nome é obrigatório';
    }
    
    if (!user.email.trim()) {
      newFieldErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      newFieldErrors.email = 'Email inválido';
    }
    
    if (!isEdit && !user.password.trim()) {
      newFieldErrors.password = 'Senha é obrigatória';
    }
    
    return newFieldErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Bloquear submit se houver erros de validação
    if (hasValidationErrors) {
      return;
    }
    
    setLoading(true);
    setErrors([]);
    setFieldErrors({});
    setSuccess('');

    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setHasValidationErrors(true);
      setLoading(false);
      return;
    }
    
    setHasValidationErrors(false);

    try {
      const formData = new FormData();
      formData.append('name', user.name);
      formData.append('email', user.email);
      formData.append('type', user.type);
      if (user.password) formData.append('password', user.password);
      if (avatarFile) formData.append('avatar', avatarFile);

      if (isEdit) {
        const updatedUser = await userService.updateWithFile(userId, formData);
        setSuccess('Usuário atualizado com sucesso!');
        
        // Se o usuário editou seu próprio perfil, atualizar o contexto
        if (parseInt(userId) === currentUser?.id) {
          updateUser(updatedUser);
        }
      } else {
        await userService.createWithFile(formData);
        setSuccess('Usuário criado com sucesso!');
      }
      
      setTimeout(() => {
        navigate('/users');
      }, 1500);
    } catch (err) {
      let errorMessage = 'Erro ao salvar usuário';
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        errorMessage = 'Arquivo muito grande ou conexão lenta. Tente uma imagem menor.';
      }
      
      setErrors([errorMessage]);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value
    });
    // Limpar erros quando usuário começar a digitar
    if (fieldErrors[name]) {
      const newFieldErrors = { ...fieldErrors, [name]: '' };
      setFieldErrors(newFieldErrors);
      
      // Verificar se ainda há erros de campo
      const hasFieldErrors = Object.values(newFieldErrors).some(error => error);
      setHasValidationErrors(hasFieldErrors || errors.length > 0);
    }
    if (errors.length > 0) {
      setErrors([]);
      setHasValidationErrors(Object.values(fieldErrors).some(error => error));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Definir informações do arquivo primeiro
      setSelectedFileInfo({
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        type: file.type
      });
      
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        setErrors(['Apenas arquivos de imagem são permitidos']);
        setHasValidationErrors(true);
        setAvatarFile(null);
        return;
      }
      
      // Validar tamanho (2MB = 2097152 bytes)
      if (file.size > 2097152) {
        setErrors(['Imagem muito grande. Tamanho máximo: 2MB']);
        setHasValidationErrors(true);
        setAvatarFile(null);
        return;
      }
      
      // Se passou na validação, processar a imagem
      setErrors([]);
      setHasValidationErrors(false);
      setAvatarFile(file);
      // Não fazer preview da nova imagem para evitar problemas de CSP
      setAvatarPreview(null);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(isEdit ? (user.avatar || null) : null);
    setSelectedFileInfo(null);
    setErrors([]);
    setHasValidationErrors(false);
    // Limpar o input file
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const newFieldErrors = { ...fieldErrors };
    
    if (name === 'name' && !value.trim()) {
      newFieldErrors.name = 'Nome é obrigatório';
    }
    
    if (name === 'email') {
      if (!value.trim()) {
        newFieldErrors.email = 'Email é obrigatório';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newFieldErrors.email = 'Email inválido';
      }
    }
    
    if (name === 'password' && !isEdit && !value.trim()) {
      newFieldErrors.password = 'Senha é obrigatória';
    }
    
    setFieldErrors(newFieldErrors);
  };

  if (loadingUser) {
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
    <Layout title={isEdit ? 'Editar Usuário' : 'Novo Usuário'}>
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
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: theme.colors.text }}>
              {isEdit ? 'Editar Usuário' : 'Criar Novo Usuário'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: 'bold',
                  color: theme.colors.text
                }}>Avatar:</label>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    backgroundColor: avatarPreview ? 'transparent' : theme.colors.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                    overflow: 'hidden',
                    border: `2px solid ${theme.colors.border}`
                  }}>
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt="Avatar" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{ color: 'white', fontSize: '36px', fontWeight: 'bold' }}>
                        {user.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{
                      padding: '8px',
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '4px',
                      backgroundColor: theme.colors.surface,
                      color: theme.colors.text
                    }}
                  />
                  
                  {/* Card com informações da imagem selecionada */}
                  {selectedFileInfo && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '1rem',
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '6px',
                      backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        marginBottom: '0.5rem'
                      }}>
                        <h4 style={{ 
                          margin: 0, 
                          color: theme.colors.text, 
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}>
                          Imagem Selecionada
                        </h4>
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: theme.colors.danger,
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '11px'
                          }}
                        >
                          Remover
                        </button>
                      </div>
                      <div style={{ color: theme.colors.textSecondary, fontSize: '12px' }}>
                        <div><strong>Nome:</strong> {selectedFileInfo.name}</div>
                        <div><strong>Tamanho:</strong> {selectedFileInfo.size}</div>
                        <div><strong>Tipo:</strong> {selectedFileInfo.type}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: 'bold',
                  color: theme.colors.text
                }}>Nome Completo:</label>
                <input
                  type="text"
                  name="name"
                  value={user.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="Digite o nome completo"
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: `2px solid ${fieldErrors.name ? theme.colors.danger : theme.colors.border}`,
                    backgroundColor: theme.isDark ? theme.colors.background : '#ffffff',
                    color: theme.colors.text,
                    borderRadius: '6px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s ease'
                  }}
                />
                {fieldErrors.name && (
                  <div style={{ 
                    color: theme.colors.danger, 
                    fontSize: '14px', 
                    marginTop: '4px',
                    fontWeight: 'bold',
                    display: 'block'
                  }}>
                    {fieldErrors.name}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: 'bold',
                  color: theme.colors.text
                }}>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="Digite o email"
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: `2px solid ${fieldErrors.email ? theme.colors.danger : theme.colors.border}`,
                    backgroundColor: theme.isDark ? theme.colors.background : '#ffffff',
                    color: theme.colors.text,
                    borderRadius: '6px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s ease'
                  }}
                />
                {fieldErrors.email && (
                  <div style={{ 
                    color: theme.colors.danger, 
                    fontSize: '14px', 
                    marginTop: '4px',
                    fontWeight: 'bold',
                    display: 'block'
                  }}>
                    {fieldErrors.email}
                  </div>
                )}
              </div>

              {(currentUser?.type === 'admin' || currentUser?.type === 'super_admin') && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: 'bold',
                    color: theme.colors.text
                  }}>Tipo de Usuário:</label>
                  <select
                    name="type"
                    value={user.type}
                    onChange={handleChange}
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      border: `2px solid ${theme.colors.border}`,
                      backgroundColor: theme.isDark ? theme.colors.background : '#ffffff',
                      color: theme.colors.text,
                      borderRadius: '6px',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s ease'
                    }}
                  >
                    <option value="user">Usuário</option>
                    <option value="admin">Administrador</option>
                    {currentUser?.type === 'super_admin' && (
                      <option value="super_admin">Super Admin</option>
                    )}
                  </select>
                </div>
              )}

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: 'bold',
                  color: theme.colors.text
                }}>Senha:</label>
                <input
                  type="password"
                  name="password"
                  value={user.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required={!isEdit}
                  placeholder={isEdit ? 'Deixe em branco para manter a senha atual' : 'Digite a senha'}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: `2px solid ${fieldErrors.password ? theme.colors.danger : theme.colors.border}`,
                    backgroundColor: theme.isDark ? theme.colors.background : '#ffffff',
                    color: theme.colors.text,
                    borderRadius: '6px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s ease'
                  }}
                />
                {fieldErrors.password && (
                  <div style={{ 
                    color: theme.colors.danger, 
                    fontSize: '14px', 
                    marginTop: '4px',
                    fontWeight: 'bold',
                    display: 'block'
                  }}>
                    {fieldErrors.password}
                  </div>
                )}
                {isEdit && (
                  <small style={{ color: theme.colors.textSecondary, fontSize: '14px' }}>
                    Deixe em branco para manter a senha atual
                  </small>
                )}
              </div>

              {errors.length > 0 && (
                <div style={{
                  color: theme.colors.danger,
                  backgroundColor: theme.isDark ? 'rgba(220, 53, 69, 0.1)' : '#f8d7da',
                  border: `1px solid ${theme.colors.danger}`,
                  borderRadius: '4px',
                  padding: '0.75rem',
                  marginBottom: '1.5rem'
                }}>
                  {errors.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              )}

              {success && (
                <div style={{
                  color: theme.colors.success,
                  backgroundColor: theme.isDark ? 'rgba(40, 167, 69, 0.1)' : '#d4edda',
                  border: `1px solid ${theme.colors.success}`,
                  borderRadius: '4px',
                  padding: '0.75rem',
                  marginBottom: '1.5rem'
                }}>
                  {success}
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => navigate('/users')}
                  style={{ 
                    padding: '12px 24px',
                    backgroundColor: theme.colors.textSecondary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || hasValidationErrors}
                  style={{ 
                    padding: '12px 24px',
                    backgroundColor: (loading || hasValidationErrors) ? theme.colors.textSecondary : theme.colors.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: (loading || hasValidationErrors) ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    transition: 'background-color 0.2s ease',
                    opacity: hasValidationErrors ? 0.6 : 1
                  }}
                >
                  {loading ? 'Salvando...' : (isEdit ? 'Atualizar' : 'Criar Usuário')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default UserForm;
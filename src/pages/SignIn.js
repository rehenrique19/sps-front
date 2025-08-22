import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/ApiService';
import LoginDTO from '../dto/LoginDTO';

function SignIn() {
  const [formData, setFormData] = useState({ 
    email: process.env.REACT_APP_DEV_EMAIL || '', 
    password: process.env.REACT_APP_DEV_PASSWORD || '' 
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const validateForm = () => {
    const newFieldErrors = {};
    
    if (!formData.email.trim()) {
      newFieldErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newFieldErrors.email = 'Email inválido';
    }
    
    if (!formData.password.trim()) {
      newFieldErrors.password = 'Senha é obrigatória';
    }
    
    return newFieldErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setLoading(true);
    setErrors([]);
    setFieldErrors({});

    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      const loginDTO = new LoginDTO(formData.email, formData.password);
      const { token, user } = await ApiService.login(
        loginDTO.email,
        loginDTO.password
      );
      
      login(user, token);
      navigate('/users');
    } catch (err) {
      setErrors(['Credenciais inválidas']);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Limpar erro do campo quando usuário começar a digitar
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: ''
      });
    }
    // Limpar erros gerais quando usuário começar a digitar
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const newFieldErrors = { ...fieldErrors };
    
    if (name === 'email') {
      if (!value.trim()) {
        newFieldErrors.email = 'Email é obrigatório';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newFieldErrors.email = 'Email inválido';
      }
    }
    
    if (name === 'password' && !value.trim()) {
      newFieldErrors.password = 'Senha é obrigatória';
    }
    
    setFieldErrors(newFieldErrors);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      margin: 0,
      padding: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: 'url(/background.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundColor: theme.colors.background,
      overflow: 'hidden'
    }}>
      <button
        onClick={toggleTheme}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          padding: '10px',
          backgroundColor: theme.colors.surface,
          color: theme.colors.text,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '50%',
          cursor: 'pointer',
          fontSize: '18px',
          width: '50px',
          height: '50px'
        }}
      >
        {theme.isDark ? '☀️' : '🌙'}
      </button>
      <div style={{
        backgroundColor: theme.colors.surface,
        padding: '3rem',
        borderRadius: '12px',
        boxShadow: theme.isDark ? '0 4px 20px rgba(255,255,255,0.1)' : '0 4px 20px rgba(0,0,0,0.15)',
        width: '90%',
        maxWidth: '450px',
        border: `1px solid ${theme.colors.border}`
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <img 
            src={theme.logo} 
            alt="SPS Logo" 
            style={{ height: '70px', marginBottom: '1.5rem' }}
          />
          <h2 style={{ margin: 0, color: theme.colors.text, fontSize: '1.8rem' }}>Login</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 'bold', color: theme.colors.text, fontSize: '1rem' }}>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              style={{
                width: '100%',
                padding: '16px',
                border: `2px solid ${fieldErrors.email ? theme.colors.danger : theme.colors.border}`,
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
            {fieldErrors.email && (
              <div style={{ 
                color: '#dc3545', 
                fontSize: '14px', 
                marginTop: '4px',
                fontWeight: 'bold',
                display: 'block'
              }}>
                {fieldErrors.email}
              </div>
            )}
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 'bold', color: theme.colors.text, fontSize: '1rem' }}>Senha:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              style={{
                width: '100%',
                padding: '16px',
                border: `2px solid ${fieldErrors.password ? theme.colors.danger : theme.colors.border}`,
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
            {fieldErrors.password && (
              <div style={{ 
                color: '#dc3545', 
                fontSize: '14px', 
                marginTop: '4px',
                fontWeight: 'bold',
                display: 'block'
              }}>
                {fieldErrors.password}
              </div>
            )}
          </div>
          
          {errors.length > 0 && (
            <div style={{ 
              color: theme.colors.danger, 
              marginBottom: '1rem',
              padding: '0.5rem',
              backgroundColor: theme.isDark ? 'rgba(220, 53, 69, 0.1)' : '#f8d7da',
              border: `1px solid ${theme.colors.danger}`,
              borderRadius: '4px'
            }}>
              {errors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: loading ? '#6c757d' : theme.colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '1rem'
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignIn;

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const SideNav = () => {
  const { theme } = useTheme();
  const { user: currentUser } = useAuth();
  const location = useLocation();

  const menuItems = [
    { path: '/users', label: 'Usuários', icon: '👥' },
    ...(currentUser?.type === 'admin' || currentUser?.type === 'super_admin' ? 
      [{ path: '/users/new', label: 'Novo Usuário', icon: '➕' }] : []
    ),
    { path: 'http://localhost:3001/api-docs', label: 'Documentação API', icon: '📚', external: true }
  ];

  return (
    <nav style={{
      width: '250px',
      height: '100vh',
      backgroundColor: theme.colors.surface,
      borderRight: `1px solid ${theme.colors.border}`,
      padding: '1rem 0',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 1000,
      boxShadow: theme.isDark ? '2px 0 4px rgba(255,255,255,0.1)' : '2px 0 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ padding: '1rem', borderBottom: `1px solid ${theme.colors.border}`, textAlign: 'center' }}>
        <img 
          src={theme.logo} 
          alt="SPS Logo" 
          style={{ height: '60px', width: 'auto', maxWidth: '100%' }}
        />
      </div>
      
      <div style={{ padding: '1rem 0' }}>
        {menuItems.map((item) => {
          const isActive = !item.external && location.pathname === item.path;
          
          if (item.external) {
            return (
              <a
                key={item.path}
                href={item.path}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 1rem',
                  color: theme.colors.text,
                  textDecoration: 'none',
                  borderLeft: '3px solid transparent',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <span style={{ marginRight: '12px', fontSize: '18px' }}>{item.icon}</span>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.label}</span>
                <span style={{ marginLeft: 'auto', fontSize: '12px' }}>↗</span>
              </a>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 1rem',
                color: isActive ? theme.colors.primary : theme.colors.text,
                textDecoration: 'none',
                backgroundColor: isActive ? (theme.isDark ? 'rgba(0,123,255,0.1)' : 'rgba(0,123,255,0.05)') : 'transparent',
                borderLeft: `3px solid ${isActive ? theme.colors.primary : 'transparent'}`,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.target.style.backgroundColor = theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{ marginRight: '12px', fontSize: '18px' }}>{item.icon}</span>
              <span style={{ fontSize: '14px', fontWeight: isActive ? '600' : '500' }}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default SideNav;
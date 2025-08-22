import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import SideNav from './SideNav';
import UserMenu from './UserMenu';

const Layout = ({ children, title }) => {
  const { theme } = useTheme();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: theme.colors.background }}>
      <SideNav />
      
      <div style={{ 
        marginLeft: '250px', 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column' 
      }}>
        {/* Header */}
        <header style={{
          backgroundColor: theme.colors.surface,
          padding: '1rem 2rem',
          borderBottom: `1px solid ${theme.colors.border}`,
          boxShadow: theme.isDark ? '0 2px 4px rgba(255,255,255,0.1)' : '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: '1.5rem', 
            color: theme.colors.text,
            fontWeight: '600'
          }}>
            {title}
          </h1>
          
          <UserMenu />
        </header>

        {/* Content */}
        <main style={{ 
          flex: 1, 
          padding: '2rem',
          backgroundColor: theme.colors.background 
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
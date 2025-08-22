import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
global.localStorage = localStorageMock;

// Test component to access context
const TestComponent = () => {
  const { user, login, logout, isAuthenticated, loading } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'loaded'}</div>
      <div data-testid="authenticated">{isAuthenticated() ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="user">{user ? user.name : 'no-user'}</div>
      <button onClick={() => login({ name: 'John' }, 'token123')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with no user when localStorage is empty', async () => {
    localStorageMock.getItem.mockReturnValue(null);

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
  });

  it('should initialize with user when localStorage has data', async () => {
    localStorageMock.getItem
      .mockReturnValueOnce('mock-token')
      .mockReturnValueOnce('{"name":"John","email":"john@example.com"}');

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
    expect(screen.getByTestId('user')).toHaveTextContent('John');
  });

  it('should handle login correctly', async () => {
    localStorageMock.getItem.mockReturnValue(null);

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    await act(async () => {
      screen.getByText('Login').click();
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'token123');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('user', '{"name":"John"}');
    expect(screen.getByTestId('user')).toHaveTextContent('John');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
  });

  it('should handle logout correctly', async () => {
    localStorageMock.getItem
      .mockReturnValueOnce('mock-token')
      .mockReturnValueOnce('{"name":"John"}');

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    await act(async () => {
      screen.getByText('Logout').click();
    });

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
  });

  it('should throw error when useAuth is used outside provider', () => {
    const TestComponentOutside = () => {
      useAuth();
      return <div>Test</div>;
    };

    expect(() => {
      render(<TestComponentOutside />);
    }).toThrow('useAuth must be used within AuthProvider');
  });
});
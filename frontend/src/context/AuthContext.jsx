import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('qloxa_auth_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('docmind_token') || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user && !!user.email && !!token;

  // Restore authenticated session on initial load
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('docmind_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const me = await api.getMe(storedToken);
        const userData = {
          id: me.id,
          name: me.name,
          email: me.email,
          role: me.role || 'Employee',
          avatarInitials: me.name ? me.name.slice(0, 2).toUpperCase() : 'EM',
          token: storedToken
        };
        setUser(userData);
        setToken(storedToken);
        localStorage.setItem('qloxa_auth_user', JSON.stringify(userData));
      } catch (err) {
        // Token invalid or expired
        localStorage.removeItem('docmind_token');
        localStorage.removeItem('qloxa_auth_user');
        setUser(null);
        setToken('');
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    setError('');

    // Input validation
    if (!email || !email.trim()) {
      setError('Please enter your work email address.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Invalid email address format (e.g. user@example.com).');
      return false;
    }

    if (!password) {
      setError('Password is required.');
      return false;
    }

    try {
      const loginResp = await api.login(email, password);
      const accessToken = loginResp.access_token;

      // Fetch verified user profile with role
      const me = await api.getMe(accessToken);
      const userData = {
        id: me.id,
        name: me.name,
        email: me.email,
        role: me.role || 'Employee',
        avatarInitials: me.name ? me.name.slice(0, 2).toUpperCase() : 'EM',
        token: accessToken
      };

      setUser(userData);
      setToken(accessToken);
      localStorage.setItem('docmind_token', accessToken);
      localStorage.setItem('qloxa_auth_user', JSON.stringify(userData));
      return true;
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
      return false;
    }
  };

  const register = async (name, email, password) => {
    setError('');

    if (!name || !name.trim()) {
      setError('Please enter your full name.');
      return false;
    }

    if (!email || !email.trim()) {
      setError('Please enter your work email address.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Invalid email address format (e.g. user@example.com).');
      return false;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }

    try {
      await api.register(name, email, password);
      return true;
    } catch (err) {
      setError(err.message || 'Registration failed. Email may already be registered.');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('docmind_token');
    localStorage.removeItem('qloxa_auth_user');
  };

  const resetPassword = (email) => {
    setError('');
    if (!email || !email.trim()) {
      setError('Please enter your registered email address.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Invalid email address format.');
      return false;
    }
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        error,
        loading,
        setError,
        login,
        register,
        logout,
        resetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

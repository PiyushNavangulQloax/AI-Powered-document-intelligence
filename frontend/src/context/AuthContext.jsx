import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);
const API_BASE_URL = 'http://localhost:8000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('qloxa_auth_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user && !!user.token;

  useEffect(() => {
    const verifyToken = async () => {
      if (user && user.token) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${user.token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            setUser(prev => ({ ...prev, ...data }));
          } else {
            logout();
          }
        } catch (err) {
          console.error("Token verification failed", err);
          logout();
        }
      }
      setLoading(false);
    };
    verifyToken();
  }, []);

  const login = async (email, password) => {
    setError('');

    if (!email || !email.trim()) {
      setError('Please enter your work email address.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Invalid email address format (e.g. user@qloax.com).');
      return false;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        const userData = {
          ...data.user,
          token: data.access_token
        };
        setUser(userData);
        localStorage.setItem('qloxa_auth_user', JSON.stringify(userData));
        return true;
      } else {
        setError(data.detail || 'Invalid email or password.');
        return false;
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
      return false;
    }
  };

  const register = async (name, email, password) => {
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await res.json();
      if (res.ok) {
        return true;
      } else {
        setError(data.detail || 'Registration failed.');
        return false;
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
      return false;
    }
  }

  const logout = () => {
    setUser(null);
    localStorage.removeItem('qloxa_auth_user');
  };

  const resetPassword = async (email) => {
    setError('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Invalid email address format.');
      return false;
    }
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      return res.ok;
    } catch (err) {
      return false;
    }
  };

  const verifyResetCode = async (email, code) => {
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      
      const data = await res.json();
      if (res.ok) return true;
      setError(data.detail || 'Invalid code');
      return false;
    } catch (err) {
      setError('Error verifying code');
      return false;
    }
  }

  const changePassword = async (email, code, new_password) => {
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, new_password })
      });
      
      const data = await res.json();
      if (res.ok) return true;
      setError(data.detail || 'Error resetting password');
      return false;
    } catch (err) {
      setError('Error resetting password');
      return false;
    }
  }

  if (loading) {
    return <div>Loading...</div>; // Could use a better spinner if one exists
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        setError,
        login,
        register,
        logout,
        resetPassword,
        verifyResetCode,
        changePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

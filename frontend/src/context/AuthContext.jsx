import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('qloxa_auth_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [error, setError] = useState('');

  const isAuthenticated = !!user && !!user.email;

  const login = async (email, password) => {
    setError('');

    // Security Rules & Email Validation
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

    // Default credential validation
    if (email.toLowerCase() === 'qloax@gmail.com' && password === 'qloax123') {
      const userData = {
        name: 'Qloax Admin',
        email: 'qloax@gmail.com',
        role: 'Enterprise Admin',
        avatarInitials: 'QX',
        token: 'qloxa_jwt_token_sec_' + Date.now()
      };
      setUser(userData);
      localStorage.setItem('qloxa_auth_user', JSON.stringify(userData));
      return true;
    }

    // Allow valid email/password login for dynamic accounts
    if (emailRegex.test(email) && password.length >= 6) {
      const nameFromEmail = email.split('@')[0];
      const userData = {
        name: nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1),
        email: email,
        role: 'Document Analyst',
        avatarInitials: nameFromEmail.slice(0, 2).toUpperCase(),
        token: 'qloxa_jwt_token_sec_' + Date.now()
      };
      setUser(userData);
      localStorage.setItem('qloxa_auth_user', JSON.stringify(userData));
      return true;
    }

    setError('Invalid email or password. Please check your credentials.');
    return false;
  };

  const logout = () => {
    setUser(null);
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
        isAuthenticated,
        error,
        setError,
        login,
        logout,
        resetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

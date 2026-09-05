import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from '../context/AuthContext';
import { ChatProvider } from '../context/ChatContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import Layout from '../components/layout/Layout';
import Home from '../pages/Home/Home';
import Login from '../pages/Login/Login';
import Register from '../pages/Register/Register';
import ForgotPassword from '../pages/ForgotPassword/ForgotPassword';
import Chat from '../pages/Chat/Chat';
import Dashboard from '../pages/Dashboard/Dashboard';
import Documents from '../pages/Documents/Documents';
import Search from '../pages/Search/Search';
import Settings from '../pages/Settings/Settings';

function AppRoutes() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('docmind-theme') || 'system';
    let activeTheme = savedTheme;
    if (savedTheme === 'system') {
      activeTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    document.documentElement.setAttribute('data-theme', activeTheme);
  }, []);

  return (
    <AuthProvider>
      <ChatProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Landing & Auth Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected System Routes (Requires Active Authentication) */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/chat" element={<Chat />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/search" element={<Search />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>

            {/* Fallback Security Redirect to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ChatProvider>
    </AuthProvider>
  );
}

export default AppRoutes;
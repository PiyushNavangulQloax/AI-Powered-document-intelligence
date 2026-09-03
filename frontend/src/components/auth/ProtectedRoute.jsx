import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect unauthenticated users directly to login page
    return <Navigate to="/login" replace state={{ from: location, message: 'Access Denied. Please log in first.' }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;

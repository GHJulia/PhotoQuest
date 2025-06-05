import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, isLoading, refreshUser } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Refresh user data when mounting protected route
    refreshUser();
  }, [refreshUser]);

  if (isLoading) {
    // You might want to show a loading spinner here
    return <div>Loading...</div>;
  }

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    // Redirect to home if not admin
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

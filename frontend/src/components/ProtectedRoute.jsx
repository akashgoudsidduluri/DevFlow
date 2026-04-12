import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// This component protects routes - only logged-in users can access them
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );
  }

  // If user is not logged in, redirect to login page with the current location saved in state
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is logged in, show the protected component
  return children;
};

export default ProtectedRoute;

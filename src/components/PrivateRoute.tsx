import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../hooks/redux';
import { CircularProgress, Box } from '@mui/material';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, token, user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // Show loading spinner if we're checking authentication or loading user data
  // Also show loading if we have a token but no user data (token validation in progress)
  if (isLoading || (token && !user && isAuthenticated)) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="background.default"
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  // Only redirect to login if we're sure the user is not authenticated
  if (!isAuthenticated || !token) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;

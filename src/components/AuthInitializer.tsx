import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { validateToken } from '../store/authSlice';
import { CircularProgress, Box } from '@mui/material';

interface AuthInitializerProps {
  children: React.ReactNode;
}

const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { token, user, isLoading } = useAppSelector((state) => state.auth);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      // If we have a token but no user data, validate the token
      if (token && !user) {
        try {
          console.log('Validating stored token...');
          await dispatch(validateToken()).unwrap();
          console.log('Token validation successful');
        } catch (error) {
          console.warn('Token validation failed:', error);
          // Token is invalid, user will be logged out by the rejected action
        }
      }
      setIsInitialized(true);
    };

    initializeAuth();
  }, [dispatch, token, user]);

  // Show loading spinner during initial auth check
  // Wait for initialization AND any token validation to complete
  if (!isInitialized || (token && !user && isLoading)) {
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

  return <>{children}</>;
};

export default AuthInitializer;

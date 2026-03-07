import { useState, useCallback, useEffect } from 'react';
import useSWR from 'swr';
import * as api from '../services/api';
import type { User, LoginRequest, RegisterRequest } from '../types/api';

// Hook for authentication
export function useAuth() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Check if token exists
  const hasToken = !!api.getToken();

  // Fetch current user if token exists
  const { data, error, isLoading, mutate } = useSWR(
    hasToken ? 'auth/me' : null,
    async () => {
      const response = await api.getCurrentUser();
      return response.data;
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  const user = data as User | undefined;
  const isAuthenticated = !!user && hasToken;

  // Login function
  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoggingIn(true);
    setAuthError(null);
    
    try {
      const response = await api.login(credentials);
      await mutate(response.user);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setAuthError(message);
      throw err;
    } finally {
      setIsLoggingIn(false);
    }
  }, [mutate]);

  // Register function
  const register = useCallback(async (data: RegisterRequest) => {
    setIsRegistering(true);
    setAuthError(null);
    
    try {
      const response = await api.register(data);
      await mutate(response.user);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setAuthError(message);
      throw err;
    } finally {
      setIsRegistering(false);
    }
  }, [mutate]);

  // Logout function
  const logout = useCallback(() => {
    api.logout();
    mutate(undefined, false);
  }, [mutate]);

  // Clear error
  const clearError = useCallback(() => {
    setAuthError(null);
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading: isLoading && hasToken,
    isLoggingIn,
    isRegistering,
    error: error || authError,
    login,
    register,
    logout,
    clearError,
  };
}

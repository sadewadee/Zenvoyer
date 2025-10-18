/**
 * useAuth Hook
 * Hook untuk auth state dan fungsi yang reusable
 */

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../store/auth';
import { authApi, UserProfile } from '../api/services/auth';
import { setAuthToken, clearAuthToken } from '../api/client';
import { TOKEN_KEY } from '../constants';
import { isAuthError, getErrorMessage } from '../api/utils/error-handler';

export interface UseAuthOptions {
  onAuthError?: (error: unknown) => void;
}

export function useAuth(options?: UseAuthOptions) {
  const {
    user,
    isLoading,
    isAuthenticated,
    login: storeLogin,
    logout: storeLogout,
    setUser,
    setLoading,
  } = useAuthStore();

  const [initalized, setInitialized] = useState(false);

  /**
   * Initialize auth on mount (restore from localStorage)
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
          setAuthToken(token);
          const profile = await authApi.getCurrentUser();
          setUser(profile);
        }
      } catch (error) {
        // Silently fail - user not authenticated
        clearAuthToken();
        localStorage.removeItem(TOKEN_KEY);
      } finally {
        setInitialized(true);
      }
    };

    initializeAuth();
  }, [setUser]);

  /**
   * Login user
   */
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setLoading(true);
        const response = await authApi.login({ email, password });

        // Save token
        localStorage.setItem(TOKEN_KEY, response.accessToken);
        setAuthToken(response.accessToken);

        // Save user
        const { accessToken, ...userProfile } = response;
        setUser(userProfile as UserProfile);

        return { success: true };
      } catch (error) {
        options?.onAuthError?.(error);
        return { success: false, error: getErrorMessage(error) };
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setUser, options]
  );

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    clearAuthToken();
    storeLogout();
  }, [storeLogout]);

  /**
   * Register user
   */
  const register = useCallback(
    async (email: string, password: string, firstName: string, lastName: string) => {
      try {
        setLoading(true);
        const response = await authApi.register({
          email,
          password,
          confirmPassword: password,
          firstName,
          lastName,
        });

        // Save token
        localStorage.setItem(TOKEN_KEY, response.accessToken);
        setAuthToken(response.accessToken);

        // Save user
        const { accessToken, ...userProfile } = response;
        setUser(userProfile as UserProfile);

        return { success: true };
      } catch (error) {
        options?.onAuthError?.(error);
        return { success: false, error: getErrorMessage(error) };
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setUser, options]
  );

  /**
   * Check permission
   */
  const hasPermission = useCallback(
    (permission: string) => {
      // TODO: Implement permission checking based on user role/permissions
      return true;
    },
    []
  );

  /**
   * Check if user is pro
   */
  const isPro = user?.subscription?.plan === 'pro';

  /**
   * Handle global auth error
   */
  useEffect(() => {
    const handleAuthError = () => {
      logout();
      options?.onAuthError?.(new Error('Unauthorized'));
    };

    window.addEventListener('auth-error', handleAuthError);
    return () => window.removeEventListener('auth-error', handleAuthError);
  }, [logout, options]);

  return {
    user,
    isLoading,
    isAuthenticated,
    initalized,
    isPro,
    login,
    logout,
    register,
    hasPermission,
  };
}

export default useAuth;

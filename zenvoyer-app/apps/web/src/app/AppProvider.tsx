/**
 * AppProvider Component
 * Setup all providers dan initialization
 */

'use client';

import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/lib/hooks/useAuth';
import { initializeApiClient } from '@/lib/api/client';
import { NotificationProvider } from '@/components/shared';

/**
 * Create query client instance
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
});

/**
 * Initialization component
 */
const AppInitializer: React.FC = () => {
  const { initalized } = useAuth();

  useEffect(() => {
    // Initialize API client
    initializeApiClient();
  }, []);

  if (!initalized) {
    return null; // Or loading screen
  }

  return null;
};

interface AppProviderProps {
  children: React.ReactNode;
}

/**
 * App provider component
 * Wraps entire app dengan semua providers
 */
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInitializer />
      <NotificationProvider />
      {children}
    </QueryClientProvider>
  );
};

export default AppProvider;

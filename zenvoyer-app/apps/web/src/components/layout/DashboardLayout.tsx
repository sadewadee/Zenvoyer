/**
 * Dashboard Layout Component
 * Main layout untuk authenticated pages
 */

'use client';

import React from 'react';

import { useAuth } from '@/lib/hooks/useAuth';
import { useUIStore } from '@/lib/store/ui';
import { cn } from '@/lib/utils/cn';

import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { LoadingSpinner, ErrorBoundary } from '@/components/shared';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Dashboard layout component
 */
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { isAuthenticated, initalized } = useAuth();
  const { sidebarOpen } = useUIStore();

  // Still loading auth
  if (!initalized) {
    return <LoadingSpinner fullScreen />;
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        Please log in to continue.
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100">
        {/* Navbar */}
        <Navbar />

        <div className="flex">
          {/* Sidebar */}
          <Sidebar />

          {/* Main content */}
          <main
            className={cn(
              'flex-1 transition-all duration-300 ease-in-out',
              sidebarOpen ? 'ml-64' : 'ml-20'
            )}
          >
            <div className="p-6 min-h-[calc(100vh-64px)]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default DashboardLayout;

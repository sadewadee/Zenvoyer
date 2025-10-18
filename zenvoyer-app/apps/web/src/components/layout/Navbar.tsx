/**
 * Navbar Component
 * Top navigation bar dengan user menu
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';

import { useAuth } from '@/lib/hooks/useAuth';
import { useUIStore } from '@/lib/store/ui';
import { ROUTES } from '@/lib/constants';

import { Button } from '@/components/shared';

/**
 * Navbar component
 */
export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-4">
          {/* Menu toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ☰
          </button>

          {/* Logo */}
          <Link href={ROUTES.DASHBOARD} className="text-xl font-bold text-blue-600">
            Zenvoyer
          </Link>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                {user?.firstName?.charAt(0)}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-gray-600">▼</span>
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                <Link
                  href={ROUTES.PROFILE}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setUserMenuOpen(false)}
                >
                  Profile Settings
                </Link>
                <Link
                  href={ROUTES.SECURITY}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setUserMenuOpen(false)}
                >
                  Security
                </Link>
                <hr className="my-1" />
                <button
                  onClick={() => {
                    logout();
                    setUserMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

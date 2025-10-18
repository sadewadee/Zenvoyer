/**
 * Sidebar Component
 * Left sidebar navigation
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useUIStore } from '@/lib/store/ui';
import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils/cn';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

/**
 * Navigation items
 */
const navItems: NavItem[] = [
  { label: 'Dashboard', href: ROUTES.DASHBOARD, icon: '📊' },
  { label: 'Invoices', href: ROUTES.INVOICES, icon: '📄' },
  { label: 'Clients', href: ROUTES.CLIENTS, icon: '👥' },
  { label: 'Products', href: ROUTES.PRODUCTS, icon: '📦' },
  { label: 'Payments', href: ROUTES.PAYMENTS, icon: '💳' },
];

/**
 * Sidebar component
 */
export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { sidebarOpen } = useUIStore();

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 bottom-0 bg-gray-900 text-white transition-all duration-300 ease-in-out z-30',
        sidebarOpen ? 'w-64' : 'w-20'
      )}
    >
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
              title={!sidebarOpen ? item.label : undefined}
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Settings at bottom */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-gray-700 p-4 space-y-2">
        <Link
          href={ROUTES.SETTINGS}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
            pathname === ROUTES.SETTINGS
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-800 hover:text-white'
          )}
          title={!sidebarOpen ? 'Settings' : undefined}
        >
          <span className="text-xl flex-shrink-0">⚙️</span>
          {sidebarOpen && <span className="text-sm font-medium">Settings</span>}
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;

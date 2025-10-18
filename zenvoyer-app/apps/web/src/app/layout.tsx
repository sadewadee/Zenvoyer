/**
 * Root Layout
 * Next.js root layout dengan providers
 */

import type { Metadata } from 'next';
import './globals.css';

import { AppProvider } from './AppProvider';

export const metadata: Metadata = {
  title: 'Zenvoyer - Invoice Management',
  description: 'Professional invoice management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}

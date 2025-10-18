/**
 * Login Page
 */

import React from 'react';
import { LoginForm } from '@/components/features/auth';

export const metadata = {
  title: 'Login - Zenvoyer',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <LoginForm />
    </div>
  );
}

/**
 * Register Page
 */

import React from 'react';
import { RegisterForm } from '@/components/features/auth';

export const metadata = {
  title: 'Register - Zenvoyer',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <RegisterForm />
    </div>
  );
}

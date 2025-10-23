/**
 * Login Form Component
 * Professional login form with validation and error handling
 */

'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, LogIn, ArrowRight, Shield } from 'lucide-react';

import { loginSchema, type LoginInput } from '@/lib/validations/auth.schema';
import { useAuth } from '@/lib/hooks/useAuth';
import { useUIStore } from '@/lib/store/ui';
import { NotificationType } from '@/lib/constants/enums';
import { ROUTES } from '@/lib/constants';

import { Button, FormField } from '@/components/shared';

/**
 * Login form component
 */
export const LoginForm: React.FC = () => {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const { addNotification } = useUIStore();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  /**
   * Handle form submission
   */
  const onSubmit = async (data: LoginInput) => {
    try {
      const result = await login(data.email, data.password);

      if (result.success) {
        addNotification({
          type: NotificationType.SUCCESS,
          message: 'Welcome back!',
          duration: 3000,
        });
        router.push(ROUTES.DASHBOARD);
      } else {
        addNotification({
          type: NotificationType.ERROR,
          message: result.error || 'Login failed',
          duration: 5000,
        });
      }
    } catch (error) {
      addNotification({
        type: NotificationType.ERROR,
        message: 'An unexpected error occurred',
        duration: 5000,
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-500">
            Sign in to your Zenvoyer account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email field */}
          <FormField
            {...register('email')}
            type="email"
            label="Email Address"
            placeholder="you@example.com"
            error={errors.email}
            icon={<Mail className="w-5 h-5 text-gray-400" />}
            required
          />

          {/* Password field */}
          <FormField
            {...register('password')}
            type="password"
            label="Password"
            placeholder="••••••••"
            error={errors.password}
            icon={<Lock className="w-5 h-5 text-gray-400" />}
            required
          />

          {/* Forgot password link */}
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1"
            >
              Forgot password?
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
            icon={<LogIn className="w-5 h-5" />}
            className="mt-6 h-12 text-base font-semibold"
          >
            Sign In
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link
              href={ROUTES.REGISTER}
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1"
            >
              Create one
              <ArrowRight className="w-4 h-4" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;

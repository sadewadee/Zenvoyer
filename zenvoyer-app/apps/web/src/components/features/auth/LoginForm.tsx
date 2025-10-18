/**
 * Login Form Component
 * Form untuk login dengan validation dan error handling
 */

'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
      <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
        {/* Header */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Welcome Back
        </h1>
        <p className="text-gray-600 mb-6">
          Sign in to your Zenvoyer account
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email field */}
          <FormField
            {...register('email')}
            type="email"
            label="Email Address"
            placeholder="you@example.com"
            error={errors.email}
            required
          />

          {/* Password field */}
          <FormField
            {...register('password')}
            type="password"
            label="Password"
            placeholder="••••••••"
            error={errors.password}
            required
          />

          {/* Forgot password link */}
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
          >
            Sign In
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-6">
          Don't have an account?{' '}
          <Link
            href={ROUTES.REGISTER}
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;

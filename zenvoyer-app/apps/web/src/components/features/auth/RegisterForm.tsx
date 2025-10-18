/**
 * Register Form Component
 * Form untuk register dengan validation dan error handling
 */

'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { registerSchema, type RegisterInput } from '@/lib/validations/auth.schema';
import { useAuth } from '@/lib/hooks/useAuth';
import { useUIStore } from '@/lib/store/ui';
import { NotificationType } from '@/lib/constants/enums';
import { ROUTES } from '@/lib/constants';

import { Button, FormField } from '@/components/shared';

/**
 * Register form component
 */
export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuth();
  const { addNotification } = useUIStore();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  /**
   * Handle form submission
   */
  const onSubmit = async (data: RegisterInput) => {
    try {
      const result = await registerUser(
        data.email,
        data.password,
        data.firstName,
        data.lastName
      );

      if (result.success) {
        addNotification({
          type: NotificationType.SUCCESS,
          message: 'Account created successfully!',
          duration: 3000,
        });
        router.push(ROUTES.DASHBOARD);
      } else {
        addNotification({
          type: NotificationType.ERROR,
          message: result.error || 'Registration failed',
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
          Create Account
        </h1>
        <p className="text-gray-600 mb-6">
          Start managing your invoices today
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name fields */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              {...register('firstName')}
              label="First Name"
              placeholder="John"
              error={errors.firstName}
              required
            />
            <FormField
              {...register('lastName')}
              label="Last Name"
              placeholder="Doe"
              error={errors.lastName}
              required
            />
          </div>

          {/* Email field */}
          <FormField
            {...register('email')}
            type="email"
            label="Email Address"
            placeholder="you@example.com"
            error={errors.email}
            required
          />

          {/* Phone field */}
          <FormField
            {...register('phoneNumber')}
            type="tel"
            label="Phone Number (Optional)"
            placeholder="+1234567890"
            error={errors.phoneNumber}
          />

          {/* Password field */}
          <FormField
            {...register('password')}
            type="password"
            label="Password"
            placeholder="••••••••"
            error={errors.password}
            helperText="At least 8 characters with uppercase, lowercase, and numbers"
            required
          />

          {/* Confirm password field */}
          <FormField
            {...register('confirmPassword')}
            type="password"
            label="Confirm Password"
            placeholder="••••••••"
            error={errors.confirmPassword}
            required
          />

          {/* Submit button */}
          <Button
            type="submit"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
          >
            Create Account
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-6">
          Already have an account?{' '}
          <Link
            href={ROUTES.LOGIN}
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;

/**
 * Register Form Component
 * Professional registration form with validation and error handling
 */

'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Phone, Lock, UserPlus, ArrowRight } from 'lucide-react';

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
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Account
          </h1>
          <p className="text-gray-500">
            Start managing your invoices today
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name fields */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              {...register('firstName')}
              label="First Name"
              placeholder="John"
              error={errors.firstName}
              icon={<User className="w-5 h-5 text-gray-400" />}
              required
            />
            <FormField
              {...register('lastName')}
              label="Last Name"
              placeholder="Doe"
              error={errors.lastName}
              icon={<User className="w-5 h-5 text-gray-400" />}
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
            icon={<Mail className="w-5 h-5 text-gray-400" />}
            required
          />

          {/* Phone field */}
          <FormField
            {...register('phoneNumber')}
            type="tel"
            label="Phone Number"
            placeholder="+1234567890"
            error={errors.phoneNumber}
            icon={<Phone className="w-5 h-5 text-gray-400" />}
          />

          {/* Password field */}
          <FormField
            {...register('password')}
            type="password"
            label="Password"
            placeholder="••••••••"
            error={errors.password}
            helperText="At least 8 characters with uppercase, lowercase, and numbers"
            icon={<Lock className="w-5 h-5 text-gray-400" />}
            required
          />

          {/* Confirm password field */}
          <FormField
            {...register('confirmPassword')}
            type="password"
            label="Confirm Password"
            placeholder="••••••••"
            error={errors.confirmPassword}
            icon={<Lock className="w-5 h-5 text-gray-400" />}
            required
          />

          {/* Submit button */}
          <Button
            type="submit"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
            icon={<ArrowRight className="w-5 h-5" />}
            className="mt-6 h-12 text-base font-semibold"
          >
            Create Account
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              href={ROUTES.LOGIN}
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1"
            >
              Sign in
              <ArrowRight className="w-4 h-4" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;

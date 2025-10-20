/**
 * Security Settings Component
 * Password management and security options
 */

'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { changePasswordSchema, type ChangePasswordInput } from '@/lib/validations/auth.schema';
import { useApiMutation } from '@/lib/hooks/useApi';
import { authApi } from '@/lib/api/services/auth';
import { useUIStore } from '@/lib/store/ui';
import { NotificationType } from '@/lib/constants/enums';

import { Button, FormField } from '@/components/shared';

/**
 * Security settings component
 */
export const SecuritySettings: React.FC = () => {
  const { addNotification } = useUIStore();

  // Change password mutation
  const changePasswordMutation = useApiMutation(authApi.changePassword);

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const { register, handleSubmit, formState: { errors }, reset } = form;

  /**
   * Handle password change
   */
  const onSubmit = async (data: ChangePasswordInput) => {
    changePasswordMutation.mutate(data, {
      onSuccess: () => {
        addNotification({
          type: NotificationType.SUCCESS,
          message: 'Password changed successfully!',
          duration: 3000,
        });
        reset();
      },
      onError: (error: any) => {
        addNotification({
          type: NotificationType.ERROR,
          message: error?.message || 'Failed to change password',
          duration: 5000,
        });
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
        <p className="text-gray-600 mt-1">Manage your account security and passwords</p>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Change Password</h3>
          <p className="text-sm text-gray-600">
            Update your password regularly to keep your account secure
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
          {/* Old Password */}
          <FormField
            {...register('oldPassword')}
            type="password"
            label="Current Password"
            placeholder="••••••••"
            error={errors.oldPassword}
            required
          />

          {/* New Password */}
          <FormField
            {...register('newPassword')}
            type="password"
            label="New Password"
            placeholder="••••••••"
            error={errors.newPassword}
            helperText="At least 8 characters with uppercase, lowercase, and numbers"
            required
          />

          {/* Confirm Password */}
          <FormField
            {...register('confirmPassword')}
            type="password"
            label="Confirm New Password"
            placeholder="••••••••"
            error={errors.confirmPassword}
            required
          />

          {/* Submit */}
          <Button
            type="submit"
            loading={changePasswordMutation.isPending}
            disabled={changePasswordMutation.isPending}
          >
            Update Password
          </Button>
        </form>
      </div>

      {/* Login Sessions */}
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Sessions</h3>
          <p className="text-sm text-gray-600">
            Manage your login sessions across devices
          </p>
        </div>

        <div className="space-y-3">
          {/* Current Session */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-gray-900">Current Session</p>
                <p className="text-sm text-gray-600 mt-1">
                  💻 Chrome on MacOS
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Last active: just now
                </p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                ACTIVE
              </span>
            </div>
          </div>

          {/* Logout Other Sessions */}
          <Button variant="secondary" className="w-full">
            Logout All Other Sessions
          </Button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white rounded-lg shadow p-6 space-y-6 border-l-4 border-yellow-500">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Two-Factor Authentication</h3>
          <p className="text-sm text-gray-600">
            Add an extra layer of security to your account
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            Two-factor authentication is currently <strong>disabled</strong>
          </p>
          <p className="text-xs text-yellow-700 mt-1">
            Enable it to require a verification code in addition to your password when logging in
          </p>
        </div>

        <Button variant="secondary">Enable Two-Factor Authentication</Button>
      </div>

      {/* Dangerous Zone */}
      <div className="bg-white rounded-lg shadow p-6 space-y-6 border-l-4 border-red-500">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Danger Zone</h3>
          <p className="text-sm text-gray-600">
            Irreversible actions that cannot be undone
          </p>
        </div>

        <Button variant="danger" fullWidth>
          Delete Account
        </Button>
        <p className="text-xs text-gray-600">
          Deleting your account will permanently remove all data associated with it
        </p>
      </div>
    </div>
  );
};

export default SecuritySettings;

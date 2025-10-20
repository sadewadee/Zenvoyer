/**
 * Profile Settings Component
 * User profile information editing
 */

'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/lib/hooks/useAuth';
import { useUIStore } from '@/lib/store/ui';
import { NotificationType } from '@/lib/constants/enums';
import { Button, FormField } from '@/components/shared';

/**
 * Profile settings component
 */
export const ProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useUIStore();
  const [isEditing, setIsEditing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
    },
  });

  const { register, handleSubmit, formState: { errors }, reset } = form;

  /**
   * Handle form submission
   */
  const onSubmit = async (_data: any) => {
    try {
      setIsLoading(true);

      // TODO: Call API to update profile
      // await userApi.updateProfile(_data);

      addNotification({
        type: NotificationType.SUCCESS,
        message: 'Profile updated successfully!',
        duration: 3000,
      });

      setIsEditing(false);
    } catch (error: any) {
      addNotification({
        type: NotificationType.ERROR,
        message: error?.message || 'Failed to update profile',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
        <p className="text-gray-600 mt-1">Update your personal information</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
            {user?.firstName?.charAt(0)}
            {user?.lastName?.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-sm text-gray-600">{user?.email}</p>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-1">
              Change Avatar
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              {...register('firstName')}
              label="First Name"
              placeholder="John"
              error={errors.firstName}
              disabled={!isEditing}
            />
            <FormField
              {...register('lastName')}
              label="Last Name"
              placeholder="Doe"
              error={errors.lastName}
              disabled={!isEditing}
            />
          </div>

          <FormField
            {...register('email')}
            type="email"
            label="Email Address"
            placeholder="you@example.com"
            error={errors.email}
            disabled={!isEditing || true} // Email typically can't be changed
          />

          <FormField
            {...register('phoneNumber')}
            type="tel"
            label="Phone Number"
            placeholder="+1234567890"
            error={errors.phoneNumber}
            disabled={!isEditing}
          />

          {/* Subscription Info */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Subscription</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900">
                Plan: <span className="capitalize">{user?.subscription?.plan}</span>
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Status: <span className="capitalize">{user?.subscription?.status}</span>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end border-t border-gray-200 pt-4">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="primary">
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsEditing(false);
                    reset();
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={isLoading} disabled={isLoading}>
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;

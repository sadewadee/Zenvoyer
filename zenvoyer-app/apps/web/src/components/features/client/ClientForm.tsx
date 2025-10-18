/**
 * Client Form Component
 * Form untuk create/edit client
 */

'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import { createClientSchema, type CreateClientInput } from '@/lib/validations/client.schema';
import { useApiMutation, useApi } from '@/lib/hooks/useApi';
import { clientApi } from '@/lib/api/services/client';
import { useUIStore } from '@/lib/store/ui';
import { NotificationType } from '@/lib/constants/enums';
import { Currency } from '@/lib/constants/enums';
import { ROUTES } from '@/lib/constants';

import { Button, FormField, LoadingSpinner } from '@/components/shared';

interface ClientFormProps {
  clientId?: string;
}

/**
 * Client form component
 */
export const ClientForm: React.FC<ClientFormProps> = ({ clientId }) => {
  const router = useRouter();
  const { addNotification } = useUIStore();

  // Fetch client if editing
  const { data: existingClient } = useApi(
    ['client', clientId],
    () => clientApi.getClient(clientId!),
    { enabled: !!clientId }
  );

  // Create/Update mutation
  const createMutation = useApiMutation(clientApi.createClient);
  const updateMutation = useApiMutation(
    (data) => clientApi.updateClient(clientId!, data)
  );

  const form = useForm<CreateClientInput>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      name: '',
      email: '',
      phoneNumber: '',
      address: '',
      taxId: '',
      currency: Currency.USD,
      tags: [],
      notes: '',
    },
  });

  const { register, handleSubmit, formState: { errors }, reset } = form;

  // Set default values when editing
  useEffect(() => {
    if (existingClient) {
      reset(existingClient as any);
    }
  }, [existingClient, reset]);

  /**
   * Handle form submission
   */
  const onSubmit = async (data: CreateClientInput) => {
    try {
      const mutate = clientId ? updateMutation.mutate : createMutation.mutate;

      mutate(data as any, {
        onSuccess: () => {
          addNotification({
            type: NotificationType.SUCCESS,
            message: clientId ? 'Client updated!' : 'Client created!',
            duration: 3000,
          });
          router.push(ROUTES.CLIENTS);
        },
        onError: (error: any) => {
          addNotification({
            type: NotificationType.ERROR,
            message: error?.message || 'Failed to save client',
            duration: 5000,
          });
        },
      });
    } catch (error) {
      addNotification({
        type: NotificationType.ERROR,
        message: 'An unexpected error occurred',
        duration: 5000,
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {clientId ? 'Edit Client' : 'Create Client'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Client Information</h2>

          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <FormField
              {...register('name')}
              label="Company Name"
              placeholder="Acme Corporation"
              error={errors.name}
              required
            />

            {/* Email */}
            <FormField
              {...register('email')}
              type="email"
              label="Email"
              placeholder="contact@acme.com"
              error={errors.email}
              required
            />

            {/* Phone */}
            <FormField
              {...register('phoneNumber')}
              type="tel"
              label="Phone Number"
              placeholder="+1234567890"
              error={errors.phoneNumber}
            />

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                {...register('currency')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select currency</option>
                {Object.values(Currency).map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Address */}
          <FormField
            {...register('address')}
            label="Address"
            placeholder="123 Main Street, City, State 12345"
            error={errors.address}
          />

          {/* Tax ID */}
          <FormField
            {...register('taxId')}
            label="Tax ID"
            placeholder="12-3456789"
            error={errors.taxId}
          />

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              {...register('notes')}
              placeholder="Add any notes about this client..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-red-500">{errors.notes.message}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end border-t border-gray-200 pt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" loading={isLoading} disabled={isLoading}>
            {clientId ? 'Update' : 'Create'} Client
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ClientForm;

/**
 * Invoice Form Component
 * Form untuk create/edit invoice dengan dynamic items
 */

'use client';

import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import {
  createInvoiceSchema,
  type CreateInvoiceInput,
} from '@/lib/validations/invoice.schema';
import { useApiMutation, useApi } from '@/lib/hooks/useApi';
import { useInvoiceCalculation } from '@/lib/hooks/useInvoiceCalculation';
import { invoiceApi, Invoice } from '@/lib/api/services/invoice';
import { clientApi } from '@/lib/api/services/client';
import { useUIStore } from '@/lib/store/ui';
import { NotificationType } from '@/lib/constants/enums';
import { ROUTES, INVOICE_DEFAULTS } from '@/lib/constants';

import { Button, FormField, LoadingSpinner } from '@/components/shared';

interface InvoiceFormProps {
  invoiceId?: string;
}

/**
 * Invoice form component
 */
export const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoiceId }) => {
  const router = useRouter();
  const { addNotification } = useUIStore();

  // Fetch clients
  const { data: clients } = useApi(
    ['clients'],
    () => clientApi.getClients(),
    { staleTime: 1000 * 60 * 10 }
  );

  // Fetch invoice if editing
  const { data: existingInvoice } = useApi(
    ['invoice', invoiceId],
    () => invoiceApi.getInvoice(invoiceId!),
    { enabled: !!invoiceId }
  );

  // Create/Update mutation
  const createMutation = useApiMutation(invoiceApi.createInvoice);
  const updateMutation = useApiMutation(
    (data) => invoiceApi.updateInvoice(invoiceId!, data)
  );

  const form = useForm<CreateInvoiceInput>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      clientId: '',
      invoiceDate: new Date().toISOString().split('T')[0] as any,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0] as any,
      currency: INVOICE_DEFAULTS.CURRENCY as any,
      taxRate: INVOICE_DEFAULTS.TAX_RATE,
      discountRate: INVOICE_DEFAULTS.DISCOUNT_RATE,
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
    },
  });

  const { register, handleSubmit, control, formState: { errors }, watch } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const items = watch('items');
  const calculations = useInvoiceCalculation(
    items.map((item) => ({
      quantity: item.quantity || 0,
      unitPrice: item.unitPrice || 0,
      discount: item.discount || 0,
      tax: item.tax || 0,
    }))
  );

  // Set default values when editing
  useEffect(() => {
    if (existingInvoice) {
      form.reset(existingInvoice as any);
    }
  }, [existingInvoice, form]);

  /**
   * Handle form submission
   */
  const onSubmit = async (data: CreateInvoiceInput) => {
    try {
      const mutate = invoiceId ? updateMutation.mutate : createMutation.mutate;

      mutate(data as any, {
        onSuccess: () => {
          addNotification({
            type: NotificationType.SUCCESS,
            message: invoiceId ? 'Invoice updated!' : 'Invoice created!',
            duration: 3000,
          });
          router.push(ROUTES.INVOICES);
        },
        onError: (error: any) => {
          addNotification({
            type: NotificationType.ERROR,
            message: error?.message || 'Failed to save invoice',
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

  if (!clients) {
    return <LoadingSpinner fullScreen text="Loading form..." />;
  }

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {invoiceId ? 'Edit Invoice' : 'Create Invoice'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Invoice Details</h2>

          <div className="grid grid-cols-2 gap-4">
            {/* Client */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client <span className="text-red-500">*</span>
              </label>
              <select
                {...register('clientId')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a client</option>
                {clients?.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
              {errors.clientId && (
                <p className="mt-1 text-sm text-red-500">{errors.clientId.message}</p>
              )}
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                {...register('currency')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="IDR">IDR</option>
              </select>
            </div>

            {/* Invoice Date */}
            <FormField
              {...register('invoiceDate')}
              type="date"
              label="Invoice Date"
              error={errors.invoiceDate}
              required
            />

            {/* Due Date */}
            <FormField
              {...register('dueDate')}
              type="date"
              label="Due Date"
              error={errors.dueDate}
              required
            />
          </div>
        </div>

        {/* Invoice Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Items</h2>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                append({ description: '', quantity: 1, unitPrice: 0 })
              }
            >
              + Add Item
            </Button>
          </div>

          <div className="space-y-3 border border-gray-200 rounded-lg p-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-12 gap-2 pb-3 border-b border-gray-200 last:border-b-0"
              >
                {/* Description */}
                <div className="col-span-4">
                  <FormField
                    {...register(`items.${index}.description`)}
                    placeholder="Product/Service"
                    error={errors.items?.[index]?.description}
                    required
                  />
                </div>

                {/* Quantity */}
                <div className="col-span-2">
                  <FormField
                    {...register(`items.${index}.quantity`, {
                      valueAsNumber: true,
                    })}
                    type="number"
                    placeholder="Qty"
                    error={errors.items?.[index]?.quantity}
                    required
                  />
                </div>

                {/* Unit Price */}
                <div className="col-span-3">
                  <FormField
                    {...register(`items.${index}.unitPrice`, {
                      valueAsNumber: true,
                    })}
                    type="number"
                    placeholder="Price"
                    error={errors.items?.[index]?.unitPrice}
                    required
                  />
                </div>

                {/* Remove */}
                <div className="col-span-2 flex items-end">
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                    fullWidth
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-gray-700">
            <span>Subtotal:</span>
            <span className="font-medium">{calculations.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Discount:</span>
            <span className="font-medium">-{calculations.totalDiscount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Tax:</span>
            <span className="font-medium">+{calculations.totalTax.toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-300 pt-2 flex justify-between text-gray-900 font-semibold text-lg">
            <span>Total:</span>
            <span>{calculations.grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            {...register('notes')}
            placeholder="Add any notes or terms..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" loading={isLoading} disabled={isLoading}>
            {invoiceId ? 'Update' : 'Create'} Invoice
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;

/**
 * Product Form Component
 * Form untuk create/edit product
 */

'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import { createProductSchema, type CreateProductInput } from '@/lib/validations/product.schema';
import { useApiMutation, useApi } from '@/lib/hooks/useApi';
import { productApi } from '@/lib/api/services/product';
import { useUIStore } from '@/lib/store/ui';
import { NotificationType } from '@/lib/constants/enums';
import { ROUTES } from '@/lib/constants';

import { Button, FormField, LoadingSpinner } from '@/components/shared';

interface ProductFormProps {
  productId?: string;
}

/**
 * Product form component
 */
export const ProductForm: React.FC<ProductFormProps> = ({ productId }) => {
  const router = useRouter();
  const { addNotification } = useUIStore();

  // Fetch product if editing
  const { data: existingProduct } = useApi(
    ['product', productId],
    () => productApi.getProduct(productId!),
    { enabled: !!productId }
  );

  // Create/Update mutation
  const createMutation = useApiMutation(productApi.createProduct);
  const updateMutation = useApiMutation(
    (data) => productApi.updateProduct(productId!, data)
  );

  const form = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: '',
      description: '',
      defaultPrice: 0,
      sku: '',
      category: '',
      notes: '',
    },
  });

  const { register, handleSubmit, formState: { errors }, reset } = form;

  // Set default values when editing
  useEffect(() => {
    if (existingProduct) {
      reset(existingProduct as any);
    }
  }, [existingProduct, reset]);

  /**
   * Handle form submission
   */
  const onSubmit = async (data: CreateProductInput) => {
    try {
      const mutate = productId ? updateMutation.mutate : createMutation.mutate;

      mutate(data as any, {
        onSuccess: () => {
          addNotification({
            type: NotificationType.SUCCESS,
            message: productId ? 'Product updated!' : 'Product created!',
            duration: 3000,
          });
          router.push('/products');
        },
        onError: (error: any) => {
          addNotification({
            type: NotificationType.ERROR,
            message: error?.message || 'Failed to save product',
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
          {productId ? 'Edit Product' : 'Create Product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Product Information</h2>

          {/* Name */}
          <FormField
            {...register('name')}
            label="Product Name"
            placeholder="e.g., Web Development Services"
            error={errors.name}
            required
          />

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              placeholder="Describe your product or service..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Price */}
          <FormField
            {...register('defaultPrice', { valueAsNumber: true })}
            type="number"
            step="0.01"
            label="Default Price"
            placeholder="0.00"
            error={errors.defaultPrice}
            required
          />

          {/* SKU */}
          <FormField
            {...register('sku')}
            label="SKU (Stock Keeping Unit)"
            placeholder="e.g., WEB-001"
            error={errors.sku}
          />

          {/* Category */}
          <FormField
            {...register('category')}
            label="Category"
            placeholder="e.g., Services"
            error={errors.category}
          />

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              {...register('notes')}
              placeholder="Add any additional notes..."
              rows={3}
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
            {productId ? 'Update' : 'Create'} Product
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;

/**
 * Product List Component
 * Display products dengan CRUD actions
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';

import { useApi, useApiMutation } from '@/lib/hooks/useApi';
import { productApi } from '@/lib/api/services/product';
import { useUIStore } from '@/lib/store/ui';
import { NotificationType } from '@/lib/constants/enums';
import { ROUTES } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils/formatting';

import { DataTable, Button, LoadingSpinner, Modal } from '@/components/shared';

/**
 * Product list component
 */
export const ProductList: React.FC = () => {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { addNotification } = useUIStore();

  // Fetch products
  const { data: products, isLoading, error, errorMessage, refetch } = useApi(
    ['products', pagination],
    () => productApi.getProducts()
  );

  // Delete mutation
  const deleteMutation = useApiMutation(productApi.deleteProduct);

  /**
   * Handle delete product
   */
  const handleDelete = (productId: string) => {
    deleteMutation.mutate(productId, {
      onSuccess: () => {
        addNotification({
          type: NotificationType.SUCCESS,
          message: 'Product deleted!',
          duration: 3000,
        });
        setDeleteConfirm(null);
        refetch();
      },
      onError: (error: any) => {
        addNotification({
          type: NotificationType.ERROR,
          message: error?.message || 'Failed to delete product',
          duration: 5000,
        });
      },
    });
  };

  // Table columns
  const columns = [
    {
      key: 'name' as const,
      label: 'Name',
      render: (value: string, row: any) => (
        <Link
          href={`/products/${row.id}/edit`}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          {value}
        </Link>
      ),
    },
    {
      key: 'description' as const,
      label: 'Description',
      render: (value?: string) => value || '-',
    },
    {
      key: 'defaultPrice' as const,
      label: 'Price',
      render: (value: number) => formatCurrency(value),
    },
    {
      key: 'category' as const,
      label: 'Category',
      render: (value?: string) => value || '-',
    },
    {
      key: 'sku' as const,
      label: 'SKU',
      render: (value?: string) => value || '-',
    },
    {
      key: 'id' as const,
      label: 'Actions',
      render: (_: any, row: any) => (
        <div className="flex gap-2">
          <Link href={`/products/${row.id}/edit`}>
            <Button variant="secondary" size="sm">
              Edit
            </Button>
          </Link>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setDeleteConfirm(row.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <Link href="/products/create">
          <Button>+ New Product</Button>
        </Link>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSpinner text="Loading products..." />
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {errorMessage}
        </div>
      ) : (
        <DataTable
          data={products || []}
          columns={columns}
          pagination={pagination}
          onPaginationChange={setPagination}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Product"
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setDeleteConfirm(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleteMutation.isPending}
              disabled={deleteMutation.isPending}
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-gray-700">
          Are you sure you want to delete this product? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default ProductList;

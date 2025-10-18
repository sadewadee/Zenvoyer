/**
 * Client List Component
 * Display list of clients dengan CRUD actions
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';

import { useApi, useApiMutation } from '@/lib/hooks/useApi';
import { clientApi } from '@/lib/api/services/client';
import { useUIStore } from '@/lib/store/ui';
import { NotificationType } from '@/lib/constants/enums';
import { ROUTES } from '@/lib/constants';

import { DataTable, Button, LoadingSpinner, Modal } from '@/components/shared';

/**
 * Client list component
 */
export const ClientList: React.FC = () => {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { addNotification } = useUIStore();

  // Fetch clients
  const { data: clients, isLoading, error, errorMessage, refetch } = useApi(
    ['clients', pagination],
    () => clientApi.getClients()
  );

  // Delete mutation
  const deleteMutation = useApiMutation(clientApi.deleteClient);

  /**
   * Handle delete client
   */
  const handleDelete = (clientId: string) => {
    deleteMutation.mutate(clientId, {
      onSuccess: () => {
        addNotification({
          type: NotificationType.SUCCESS,
          message: 'Client deleted!',
          duration: 3000,
        });
        setDeleteConfirm(null);
        refetch();
      },
      onError: (error: any) => {
        addNotification({
          type: NotificationType.ERROR,
          message: error?.message || 'Failed to delete client',
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
          href={ROUTES.CLIENT_EDIT.replace(':id', row.id)}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          {value}
        </Link>
      ),
    },
    {
      key: 'email' as const,
      label: 'Email',
    },
    {
      key: 'phoneNumber' as const,
      label: 'Phone',
      render: (value?: string) => value || '-',
    },
    {
      key: 'currency' as const,
      label: 'Currency',
      render: (value?: string) => value || 'USD',
    },
    {
      key: 'id' as const,
      label: 'Actions',
      render: (_: any, row: any) => (
        <div className="flex gap-2">
          <Link href={ROUTES.CLIENT_EDIT.replace(':id', row.id)}>
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
        <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
        <Link href={ROUTES.CLIENT_CREATE}>
          <Button>+ New Client</Button>
        </Link>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSpinner text="Loading clients..." />
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {errorMessage}
        </div>
      ) : (
        <DataTable
          data={clients || []}
          columns={columns}
          pagination={pagination}
          onPaginationChange={setPagination}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Client"
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
          Are you sure you want to delete this client? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default ClientList;

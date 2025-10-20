/**
 * Invoice List Component
 * Display list of invoices dengan filters dan actions
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

import { useApi } from '@/lib/hooks/useApi';
import { invoiceApi } from '@/lib/api/services/invoice';
import { ROUTES } from '@/lib/constants';
import { InvoiceStatus } from '@/lib/constants/enums';

import {
  DataTable,
  Button,
  StatusBadge,
  LoadingSpinner,
} from '@/components/shared';

/**
 * Invoice list component
 */
export const InvoiceList: React.FC = () => {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [filters, setFilters] = useState<{ status?: InvoiceStatus }>({});

  // Fetch invoices
  const { data: invoices, isLoading, error, errorMessage } = useApi(
    ['invoices', pagination, filters],
    () =>
      invoiceApi.getInvoices({
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
        status: filters.status,
      }),
    { staleTime: 1000 * 60 * 5 } // 5 minutes
  );

  // Table columns
  const columns = [
    {
      key: 'invoiceNumber' as const,
      label: 'Invoice #',
      width: 'w-24',
      render: (value: string, row: any) => (
        <Link
          href={ROUTES.INVOICE_VIEW.replace(':id', row.id)}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          {value}
        </Link>
      ),
    },
    {
      key: 'client' as const,
      label: 'Client',
      render: (_: any, row: any) => (
        <span>{row.client?.name || 'N/A'}</span>
      ),
    },
    {
      key: 'grandTotal' as const,
      label: 'Amount',
      render: (value: number, row: any) => (
        <span className="font-medium">
          {row.currency} {value.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: string) => <StatusBadge status={value} />,
    },
    {
      key: 'dueDate' as const,
      label: 'Due Date',
      render: (value: string) => (
        <span className="text-sm text-gray-600">
          {formatDistanceToNow(new Date(value), { addSuffix: true })}
        </span>
      ),
    },
    {
      key: 'id' as const,
      label: 'Actions',
      render: (_: any, row: any) => (
        <div className="flex gap-2">
          <Link href={ROUTES.INVOICE_VIEW.replace(':id', row.id)}>
            <Button variant="secondary" size="sm">
              View
            </Button>
          </Link>
          {row.status === InvoiceStatus.DRAFT && (
            <Link href={ROUTES.INVOICE_EDIT.replace(':id', row.id)}>
              <Button variant="secondary" size="sm">
                Edit
              </Button>
            </Link>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <Link href={ROUTES.INVOICE_CREATE}>
          <Button>+ New Invoice</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilters({})}
          className={`px-4 py-2 rounded-lg transition-colors ${
            !filters.status
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All
        </button>
        {Object.values(InvoiceStatus).map((status) => (
          <button
            key={status}
            onClick={() => setFilters({ status })}
            className={`px-4 py-2 rounded-lg transition-colors capitalize ${
              filters.status === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSpinner text="Loading invoices..." />
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {errorMessage}
        </div>
      ) : (
        <DataTable
          data={invoices || []}
          columns={columns}
          pagination={pagination}
          onPaginationChange={setPagination}
        />
      )}
    </div>
  );
};

export default InvoiceList;

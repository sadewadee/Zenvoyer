/**
 * DataTable Component
 * Reusable data table dengan pagination, sorting, dan filtering
 */

import React, { useMemo, useState } from 'react';
import { Button } from './Button';
import { cn } from '../../lib/utils/cn';

export interface Column<T> {
  key: keyof T;
  label: string;
  width?: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
}

interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  error?: string;
  onRowClick?: (row: T) => void;
  pagination?: PaginationState;
  onPaginationChange?: (pagination: PaginationState) => void;
  rowKey?: keyof T;
  selectable?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
}

/**
 * Reusable data table component
 */
export const DataTable = React.forwardRef<HTMLDivElement, DataTableProps<any>>(
  (
    {
      data,
      columns,
      loading,
      error,
      onRowClick,
      pagination,
      onPaginationChange,
      rowKey = 'id' as any,
      selectable = false,
      onSelectionChange,
    },
    ref
  ) => {
    const [selectedRows, setSelectedRows] = useState<Set<any>>(new Set());

    // Calculate pagination
    const paginatedData = useMemo(() => {
      if (!pagination) return data;

      const start = pagination.pageIndex * pagination.pageSize;
      const end = start + pagination.pageSize;
      return data.slice(start, end);
    }, [data, pagination]);

    const totalPages = Math.ceil(data.length / (pagination?.pageSize || 10));

    // Handle row selection
    const handleSelectRow = (rowId: any) => {
      const newSelected = new Set(selectedRows);
      if (newSelected.has(rowId)) {
        newSelected.delete(rowId);
      } else {
        newSelected.add(rowId);
      }
      setSelectedRows(newSelected);
      onSelectionChange?.(data.filter((row) => newSelected.has(row[rowKey])));
    };

    // Handle select all
    const handleSelectAll = () => {
      if (selectedRows.size === paginatedData.length) {
        setSelectedRows(new Set());
        onSelectionChange?.([]);
      } else {
        const newSelected = new Set(paginatedData.map((row) => row[rowKey]));
        setSelectedRows(newSelected);
        onSelectionChange?.(paginatedData);
      }
    };

    if (error) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      );
    }

    if (loading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin">Loading...</div>
        </div>
      );
    }

    if (paginatedData.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No data available
        </div>
      );
    }

    return (
      <div ref={ref} className="w-full">
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {selectable && (
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={cn(
                      'px-6 py-3 text-left text-sm font-semibold text-gray-700',
                      column.width
                    )}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedData.map((row, idx) => (
                <tr
                  key={String(row[rowKey] || idx)}
                  className={cn(
                    'hover:bg-gray-50 transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectable && (
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedRows.has(row[rowKey])}
                        onChange={() => handleSelectRow(row[rowKey])}
                        className="rounded border-gray-300"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={cn(
                        'px-6 py-4 text-sm text-gray-900',
                        column.width
                      )}
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : String(row[column.key] || '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="flex items-center justify-between mt-4 px-2">
            <div className="text-sm text-gray-600">
              Showing {pagination.pageIndex * pagination.pageSize + 1} to{' '}
              {Math.min((pagination.pageIndex + 1) * pagination.pageSize, data.length)} of{' '}
              {data.length}
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.pageIndex === 0}
                onClick={() =>
                  onPaginationChange?.({
                    ...pagination,
                    pageIndex: Math.max(0, pagination.pageIndex - 1),
                  })
                }
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i}
                    variant={pagination.pageIndex === i ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() =>
                      onPaginationChange?.({
                        ...pagination,
                        pageIndex: i,
                      })
                    }
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.pageIndex >= totalPages - 1}
                onClick={() =>
                  onPaginationChange?.({
                    ...pagination,
                    pageIndex: Math.min(totalPages - 1, pagination.pageIndex + 1),
                  })
                }
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

DataTable.displayName = 'DataTable';

export default DataTable;

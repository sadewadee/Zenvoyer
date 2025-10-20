/**
 * Advanced Invoice Filters Component
 * Reusable filters untuk invoice list
 */

'use client';

import React from 'react';
import { Button } from '@/components/shared';
import { InvoiceStatus } from '@/lib/constants/enums';

interface InvoiceFiltersProps {
  onFilterChange: (filters: InvoiceFiltersState) => void;
  loading?: boolean;
}

export interface InvoiceFiltersState {
  status?: InvoiceStatus;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  clientId?: string;
}

/**
 * Invoice filters component
 */
export const InvoiceFilters: React.FC<InvoiceFiltersProps> = ({
  onFilterChange,
  loading,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [filters, setFilters] = React.useState<InvoiceFiltersState>({});

  const handleStatusChange = (status: InvoiceStatus | undefined) => {
    const newFilters = { ...filters, status };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    const newFilters = { ...filters, dateFrom: startDate, dateTo: endDate };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleAmountRangeChange = (minAmount: number, maxAmount: number) => {
    const newFilters = { ...filters, minAmount, maxAmount };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    setFilters({});
    onFilterChange({});
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined && v !== '');

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div
        className="px-6 py-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔍</span>
            <h3 className="font-semibold text-gray-900">Advanced Filters</h3>
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                {Object.values(filters).filter((v) => v !== undefined && v !== '').length} active
              </span>
            )}
          </div>
          <span>{isExpanded ? '▼' : '▶'}</span>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="px-6 py-4 space-y-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleStatusChange(undefined)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filters.status === undefined
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              {Object.values(InvoiceStatus).map((status) => (
                <button
                  key={status}
                  onClick={() =>
                    handleStatusChange(filters.status === status ? undefined : status)
                  }
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors capitalize ${
                    filters.status === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) =>
                  handleDateRangeChange(e.target.value, filters.dateTo || '')
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) =>
                  handleDateRangeChange(filters.dateFrom || '', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Amount Range Filter */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Amount
              </label>
              <input
                type="number"
                value={filters.minAmount || ''}
                onChange={(e) =>
                  handleAmountRangeChange(
                    e.target.value ? parseInt(e.target.value) : 0,
                    filters.maxAmount || 0
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Amount
              </label>
              <input
                type="number"
                value={filters.maxAmount || ''}
                onChange={(e) =>
                  handleAmountRangeChange(
                    filters.minAmount || 0,
                    e.target.value ? parseInt(e.target.value) : 0
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end border-t border-gray-200 pt-4">
            <Button
              variant="secondary"
              onClick={handleReset}
              disabled={!hasActiveFilters || loading}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceFilters;

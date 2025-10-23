/**
 * Dashboard Metrics Component
 * Display key metrics dan statistics
 */

'use client';

import React from 'react';
import { FileText, DollarSign, Clock, Users } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils/formatting';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changePercent?: number;
  trend?: 'up' | 'down';
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'yellow';
}

/**
 * Single metric card
 */
const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changePercent,
  trend,
  icon,
  color = 'blue',
}) => {
  const bgColor = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    red: 'bg-red-50',
    yellow: 'bg-yellow-50',
  }[color];

  const textColor = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
  }[color];

  const trendColor = trend === 'up' ? 'text-green-600' : 'text-red-600';
  const trendIcon = trend === 'up' ? '↑' : '↓';

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>

          {change !== undefined && changePercent !== undefined && (
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-sm font-semibold ${trendColor}`}>
                {trendIcon} {Math.abs(changePercent)}%
              </span>
              <span className="text-xs text-gray-600">
                {change >= 0 ? '+' : ''}{change}
              </span>
            </div>
          )}
        </div>

        {icon && (
          <div className={`${bgColor} ${textColor} rounded-lg p-3`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

interface DashboardMetricsProps {
  totalInvoices: number;
  totalRevenue: number;
  totalUnpaid: number;
  totalClients: number;
  invoiceChange?: number;
  revenueChange?: number;
  conversionRate?: number;
  loading?: boolean;
}

/**
 * Dashboard metrics grid
 */
export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  totalInvoices,
  totalRevenue,
  totalUnpaid,
  totalClients,
  invoiceChange,
  revenueChange,
  loading,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total Invoices"
        value={formatNumber(totalInvoices)}
        change={invoiceChange}
        changePercent={invoiceChange ? Math.round((invoiceChange / totalInvoices) * 100) : 0}
        trend={invoiceChange && invoiceChange > 0 ? 'up' : 'down'}
        icon={<FileText className="w-6 h-6" />}
        color="blue"
      />

      <MetricCard
        title="Total Revenue"
        value={formatCurrency(totalRevenue)}
        change={revenueChange}
        changePercent={revenueChange ? Math.round((revenueChange / totalRevenue) * 100) : 0}
        trend={revenueChange && revenueChange > 0 ? 'up' : 'down'}
        icon={<DollarSign className="w-6 h-6" />}
        color="green"
      />

      <MetricCard
        title="Unpaid Amount"
        value={formatCurrency(totalUnpaid)}
        icon={<Clock className="w-6 h-6" />}
        color="red"
      />

      <MetricCard
        title="Total Clients"
        value={formatNumber(totalClients)}
        icon={<Users className="w-6 h-6" />}
        color="yellow"
      />
    </div>
  );
};

export default DashboardMetrics;

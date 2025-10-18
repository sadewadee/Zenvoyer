/**
 * Complete Dashboard Component
 * Full dashboard dengan metrics, charts, dan recent activity
 */

'use client';

import React from 'react';
import Link from 'next/link';

import { useApi } from '@/lib/hooks/useApi';
import { dashboardApi } from '@/lib/api/services/dashboard';
import { ROUTES } from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/utils/formatting';
import { sum } from '@/lib/utils/data';

import { LoadingSpinner, Button, StatusBadge } from '@/components/shared';
import { DashboardMetrics } from './DashboardMetrics';
import { BarChart, PieChart, LineChart } from './DashboardCharts';

/**
 * Complete dashboard component
 */
export const Dashboard: React.FC = () => {
  // Fetch dashboard data
  const { data: dashboardData, isLoading, error, errorMessage } = useApi(
    ['dashboard'],
    () => dashboardApi.getUserDashboard(),
    { staleTime: 1000 * 60 * 5 } // 5 minutes
  );

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {errorMessage}
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
        No dashboard data available
      </div>
    );
  }

  const {
    stats,
    revenueChart,
    statusChart,
    topClients,
    recentInvoices,
    overdueInvoices,
  } = dashboardData;

  // Prepare chart data
  const invoiceStatusData = statusChart?.map((item) => ({
    label: item.label,
    value: item.value,
    percentage: item.percentage,
  })) || [];

  const revenueData = revenueChart?.map((item) => ({
    label: item.label.slice(-2), // Get last 2 digits of month
    value: item.value,
  })) || [];

  const topClientsData = topClients?.map((client) => ({
    label: client.name,
    value: client.totalAmount,
  })) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your business overview.</p>
        </div>
      </div>

      {/* Metrics */}
      <DashboardMetrics
        totalInvoices={stats?.totalInvoices?.value || 0}
        totalRevenue={stats?.totalRevenue?.value || 0}
        totalUnpaid={stats?.totalUnpaid?.value || 0}
        totalClients={0}
        invoiceChange={stats?.totalInvoices?.change}
        revenueChange={stats?.totalRevenue?.change}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        {revenueData.length > 0 && (
          <LineChart title="Monthly Revenue" data={revenueData} />
        )}

        {/* Invoice Status Chart */}
        {invoiceStatusData.length > 0 && (
          <PieChart title="Invoice Status Distribution" data={invoiceStatusData} />
        )}

        {/* Top Clients */}
        {topClientsData.length > 0 && (
          <BarChart title="Top Clients by Revenue" data={topClientsData} />
        )}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Invoices</h2>
            <Link href={ROUTES.INVOICES}>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>

          <div className="divide-y divide-gray-200">
            {recentInvoices && recentInvoices.length > 0 ? (
              recentInvoices.slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <Link
                        href={ROUTES.INVOICE_VIEW.replace(':id', invoice.id)}
                        className="font-medium text-blue-600 hover:text-blue-700"
                      >
                        {invoice.invoiceNumber}
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">
                        {invoice.clientName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(invoice.amount)}
                      </p>
                      <StatusBadge status={invoice.status} size="sm" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-600">
                No recent invoices
              </div>
            )}
          </div>
        </div>

        {/* Overdue Invoices */}
        <div className="bg-white rounded-lg shadow overflow-hidden border-l-4 border-red-500">
          <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
            <h2 className="text-lg font-semibold text-red-900">Overdue Invoices</h2>
            <p className="text-sm text-red-700 mt-1">
              {overdueInvoices?.length || 0} invoice(s) require attention
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {overdueInvoices && overdueInvoices.length > 0 ? (
              overdueInvoices.slice(0, 5).map((invoice) => (
                <div
                  key={invoice.id}
                  className="px-6 py-4 hover:bg-red-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <Link
                        href={ROUTES.INVOICE_VIEW.replace(':id', invoice.id)}
                        className="font-medium text-red-600 hover:text-red-700"
                      >
                        {invoice.invoiceNumber}
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">
                        Due {formatDate(invoice.dueDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(invoice.amount)}
                      </p>
                      <p className="text-xs text-red-600 font-semibold">
                        OVERDUE
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-600">
                No overdue invoices - Great job! 🎉
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href={ROUTES.INVOICE_CREATE}>
            <Button variant="secondary" fullWidth>
              📄 New Invoice
            </Button>
          </Link>
          <Link href={ROUTES.CLIENT_CREATE}>
            <Button variant="secondary" fullWidth>
              👥 New Client
            </Button>
          </Link>
          <Link href={ROUTES.INVOICES}>
            <Button variant="secondary" fullWidth>
              📋 View All Invoices
            </Button>
          </Link>
          <Link href={ROUTES.CLIENTS}>
            <Button variant="secondary" fullWidth>
              👤 View All Clients
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

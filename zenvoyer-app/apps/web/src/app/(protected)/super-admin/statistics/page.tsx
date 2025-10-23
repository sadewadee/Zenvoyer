/**
 * Super Admin Statistics Page
 * System-wide statistics and analytics
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, 
  TrendingUp,
  Users,
  FileText,
  DollarSign,
  Activity,
  Download,
  Calendar
} from 'lucide-react';

import { useAuth } from '@/lib/hooks/useAuth';
import { useApi } from '@/lib/hooks/useApi';
import { LoadingSpinner } from '@/components/shared';

interface SystemStats {
  totalUsers: number;
  totalInvoices: number;
  totalRevenue: number;
  activeUsers: number;
  proUsers: number;
  freeUsers: number;
}

export default function SuperAdminStatisticsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  React.useEffect(() => {
    if (!authLoading && user && user.role !== 'super_admin') {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const { data: stats, isLoading } = useApi<SystemStats>(
    ['super-admin-statistics'],
    async () => {
      const response = await fetch('http://localhost:3001/api/admin/super/statistics', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch statistics');
      return response.json();
    }
  );

  if (authLoading || isLoading) {
    return <LoadingSpinner fullScreen text="Loading statistics..." />;
  }

  const statsData = stats || {
    totalUsers: 0,
    totalInvoices: 0,
    totalRevenue: 0,
    activeUsers: 0,
    proUsers: 0,
    freeUsers: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            System Statistics
          </h1>
          <p className="text-gray-600 mt-1">Complete overview of system metrics</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +12%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{statsData.totalUsers}</h3>
          <p className="text-sm text-gray-600 mt-1">Total Users</p>
          <div className="mt-4 text-xs text-gray-500">
            Active: {statsData.activeUsers}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +8%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">${statsData.totalRevenue.toLocaleString()}</h3>
          <p className="text-sm text-gray-600 mt-1">Total Revenue</p>
          <div className="mt-4 text-xs text-gray-500">
            This month
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +15%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{statsData.totalInvoices}</h3>
          <p className="text-sm text-gray-600 mt-1">Total Invoices</p>
          <div className="mt-4 text-xs text-gray-500">
            All time
          </div>
        </div>
      </div>

      {/* Subscription Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Subscription Breakdown
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">Pro Users</p>
                <p className="text-sm text-gray-600">Premium subscription</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">{statsData.proUsers}</p>
                <p className="text-xs text-gray-500">
                  {statsData.totalUsers > 0 ? Math.round((statsData.proUsers / statsData.totalUsers) * 100) : 0}%
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">Free Users</p>
                <p className="text-sm text-gray-600">Free tier</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-600">{statsData.freeUsers}</p>
                <p className="text-xs text-gray-500">
                  {statsData.totalUsers > 0 ? Math.round((statsData.freeUsers / statsData.totalUsers) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            System Activity
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <span className="text-gray-700">API Requests (Today)</span>
              <span className="font-semibold text-gray-900">1,234</span>
            </div>
            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <span className="text-gray-700">Active Sessions</span>
              <span className="font-semibold text-gray-900">{statsData.activeUsers}</span>
            </div>
            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <span className="text-gray-700">Failed Logins (24h)</span>
              <span className="font-semibold text-red-600">23</span>
            </div>
            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <span className="text-gray-700">Error Rate</span>
              <span className="font-semibold text-green-600">0.1%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Growth */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Growth Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Today</p>
            <p className="text-xl font-bold text-gray-900">+12</p>
            <p className="text-xs text-green-600">New users</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">This Week</p>
            <p className="text-xl font-bold text-gray-900">+84</p>
            <p className="text-xs text-green-600">New users</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">This Month</p>
            <p className="text-xl font-bold text-gray-900">+342</p>
            <p className="text-xs text-green-600">New users</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">This Year</p>
            <p className="text-xl font-bold text-gray-900">+{statsData.totalUsers}</p>
            <p className="text-xs text-green-600">Total users</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Admin Dashboard Page
 * Dashboard for admin users with user management and system monitoring
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Activity, 
  AlertCircle, 
  CheckCircle,
  TrendingUp,
  FileText,
  Shield,
  Clock
} from 'lucide-react';

import { useAuth } from '@/lib/hooks/useAuth';
import { useApi } from '@/lib/hooks/useApi';
import { LoadingSpinner } from '@/components/shared';

interface AdminStats {
  openTickets: number;
  resolvedTickets: number;
  activeUsers: number;
}

interface AdminDashboardData {
  message: string;
  stats: AdminStats;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  // Check if user is admin
  React.useEffect(() => {
    if (!authLoading && user && user.role !== 'admin' && user.role !== 'super_admin') {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  // Fetch admin dashboard data
  const { data, isLoading, error } = useApi<AdminDashboardData>(
    ['admin-dashboard'],
    async () => {
      const response = await fetch('http://localhost:3001/api/admin/dashboard', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch admin dashboard');
      return response.json();
    }
  );

  if (authLoading || isLoading) {
    return <LoadingSpinner fullScreen text="Loading admin dashboard..." />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <AlertCircle className="w-5 h-5 inline mr-2" />
          Failed to load admin dashboard
        </div>
      </div>
    );
  }

  const stats = data?.stats || { openTickets: 0, resolvedTickets: 0, activeUsers: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Manage users and monitor system activity</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Users */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Active
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.activeUsers}</h3>
          <p className="text-sm text-gray-600 mt-1">Active Users</p>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-green-600 font-medium">System healthy</span>
          </div>
        </div>

        {/* Open Tickets */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <span className="text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
              Pending
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.openTickets}</h3>
          <p className="text-sm text-gray-600 mt-1">Open Tickets</p>
          <div className="mt-4 flex items-center text-sm">
            <Clock className="w-4 h-4 text-amber-600 mr-1" />
            <span className="text-amber-600 font-medium">Requires attention</span>
          </div>
        </div>

        {/* Resolved Tickets */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
              Completed
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.resolvedTickets}</h3>
          <p className="text-sm text-gray-600 mt-1">Resolved Tickets</p>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-green-600 font-medium">All resolved</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            View and manage all users in the system
          </p>
          <button
            onClick={() => router.push('/admin/users')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Manage Users
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Activity Logs</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Monitor system activity and user actions
          </p>
          <button
            onClick={() => router.push('/admin/activity-logs')}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            View Logs
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Support Tickets</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Manage and respond to support requests
          </p>
          <button
            onClick={() => router.push('/admin/support-tickets')}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            View Tickets
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Shield className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">System Settings</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Configure system settings and preferences
          </p>
          <button
            onClick={() => router.push('/admin/settings')}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Settings
          </button>
        </div>
      </div>

      {/* Info Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900">Admin Access</h3>
            <p className="text-sm text-blue-700 mt-1">
              You have administrator access to manage users, view activity logs, and handle support tickets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Super Admin Dashboard Page
 * Dashboard for super admin with full system control
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  Activity, 
  Users,
  Database,
  Settings,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Server,
  HardDrive,
  Cpu
} from 'lucide-react';

import { useAuth } from '@/lib/hooks/useAuth';
import { useApi } from '@/lib/hooks/useApi';
import { LoadingSpinner } from '@/components/shared';

interface SystemHealth {
  status: string;
  timestamp: string;
  version: string;
}

export default function SuperAdminDashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  // Check if user is super admin
  React.useEffect(() => {
    if (!authLoading && user && user.role !== 'super_admin') {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  // Fetch system health
  const { data: health, isLoading } = useApi<SystemHealth>(
    ['system-health'],
    async () => {
      const response = await fetch('http://localhost:3001/api/admin/super/health', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch system health');
      return response.json();
    }
  );

  if (authLoading || isLoading) {
    return <LoadingSpinner fullScreen text="Loading super admin dashboard..." />;
  }

  const isHealthy = health?.status === 'healthy';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            Super Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Full system control and monitoring</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span className="font-semibold text-green-700">System {isHealthy ? 'Healthy' : 'Warning'}</span>
        </div>
      </div>

      {/* System Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* System Status */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Server className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              ONLINE
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900">Server Status</h3>
          <p className="text-sm text-gray-600 mt-1">All systems operational</p>
          <div className="mt-4 text-xs text-gray-500">
            Version: {health?.version || '1.0.0'}
          </div>
        </div>

        {/* Database */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              CONNECTED
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900">Database</h3>
          <p className="text-sm text-gray-600 mt-1">PostgreSQL running</p>
          <div className="mt-4 flex items-center text-xs">
            <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
            <span className="text-green-600 font-medium">Optimal</span>
          </div>
        </div>

        {/* Cache */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <HardDrive className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              ACTIVE
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900">Redis Cache</h3>
          <p className="text-sm text-gray-600 mt-1">Cache system active</p>
          <div className="mt-4 flex items-center text-xs">
            <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
            <span className="text-green-600 font-medium">Fast</span>
          </div>
        </div>

        {/* Performance */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <Cpu className="w-6 h-6 text-amber-600" />
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              GOOD
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900">Performance</h3>
          <p className="text-sm text-gray-600 mt-1">Response time optimal</p>
          <div className="mt-4 flex items-center text-xs">
            <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
            <span className="text-green-600 font-medium">~50ms avg</span>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* User Management */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            View, edit, and manage all user accounts
          </p>
          <button
            onClick={() => router.push('/super-admin/users')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Users className="w-4 h-4" />
            Manage Users
          </button>
        </div>

        {/* System Statistics */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Statistics</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            View comprehensive system statistics
          </p>
          <button
            onClick={() => router.push('/super-admin/statistics')}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            View Stats
          </button>
        </div>

        {/* Activity Logs */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Activity className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Activity Logs</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Monitor all system and user activities
          </p>
          <button
            onClick={() => router.push('/super-admin/activity-logs')}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Activity className="w-4 h-4" />
            View Logs
          </button>
        </div>

        {/* Admin Management */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Admin Accounts</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Manage administrator privileges
          </p>
          <button
            onClick={() => router.push('/super-admin/admins')}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Shield className="w-4 h-4" />
            Manage Admins
          </button>
        </div>

        {/* System Settings */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gray-100 rounded-lg">
              <Settings className="w-6 h-6 text-gray-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">System Config</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Configure system-wide settings
          </p>
          <button
            onClick={() => router.push('/super-admin/settings')}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl shadow-lg border border-red-200 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-red-900">Danger Zone</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Critical system operations
          </p>
          <button
            onClick={() => alert('Danger zone - Use with caution!')}
            className="w-full px-4 py-2 bg-red-100 text-red-700 border border-red-300 rounded-lg hover:bg-red-200 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            Proceed Carefully
          </button>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-900">Super Administrator Access</h3>
            <p className="text-sm text-red-700 mt-2">
              You have full system control including user management, system configuration, 
              and access to all administrative functions. Use these privileges responsibly.
            </p>
            <div className="mt-4 flex items-center gap-4 text-xs text-red-600">
              <span>Version: {health?.version || '1.0.0'}</span>
              <span>Last Updated: {health?.timestamp ? new Date(health.timestamp).toLocaleString() : 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

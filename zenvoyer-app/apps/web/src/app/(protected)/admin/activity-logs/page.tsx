/**
 * Admin Activity Logs Page
 * Monitor user activities and system events
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Activity, 
  Search, 
  Filter,
  Download,
  Eye,
  User,
  Clock
} from 'lucide-react';

import { useAuth } from '@/lib/hooks/useAuth';
import { useApi } from '@/lib/hooks/useApi';
import { LoadingSpinner } from '@/components/shared';

interface ActivityLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export default function AdminActivityLogsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  React.useEffect(() => {
    if (!authLoading && user && user.role !== 'admin' && user.role !== 'super_admin') {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const { data: logs, isLoading, error } = useApi<ActivityLog[]>(
    ['admin-activity-logs'],
    async () => {
      const response = await fetch('http://localhost:3001/api/admin/activity-logs', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch activity logs');
      return response.json();
    }
  );

  if (authLoading || isLoading) {
    return <LoadingSpinner fullScreen text="Loading activity logs..." />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Failed to load activity logs. Please try again.
        </div>
      </div>
    );
  }

  const filteredLogs = (logs || []).filter((log) => {
    const matchesSearch = 
      log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    
    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: string) => {
    const colors = {
      create: 'bg-green-100 text-green-700 border-green-200',
      update: 'bg-blue-100 text-blue-700 border-blue-200',
      delete: 'bg-red-100 text-red-700 border-red-200',
      login: 'bg-purple-100 text-purple-700 border-purple-200',
      logout: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[action.toLowerCase() as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Activity className="w-8 h-8 text-purple-600" />
            Activity Logs
          </h1>
          <p className="text-gray-600 mt-1">
            {filteredLogs.length} activit{filteredLogs.length !== 1 ? 'ies' : 'y'} found
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          <Download className="w-4 h-4" />
          Export Logs
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by user, action, or resource..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Action Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h2>
          
          <div className="space-y-4">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold border ${getActionBadge(log.action)}`}>
                        {log.action.toUpperCase()}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {log.resource}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {log.userEmail}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                      {log.ipAddress && (
                        <div className="text-gray-500">
                          IP: {log.ipAddress}
                        </div>
                      )}
                    </div>
                    
                    {log.details && (
                      <p className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                        {log.details}
                      </p>
                    )}
                  </div>
                  
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                No activity logs found matching your criteria
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

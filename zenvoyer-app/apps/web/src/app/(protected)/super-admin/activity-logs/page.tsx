/**
 * Super Admin Activity Logs Page
 * Complete system activity logs with advanced filtering
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Activity, 
  Search, 
  Filter,
  Download,
  User,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info
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
  userAgent?: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  createdAt: string;
}

export default function SuperAdminActivityLogsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

  React.useEffect(() => {
    if (!authLoading && user && user.role !== 'super_admin') {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const { data: logs, isLoading } = useApi<ActivityLog[]>(
    ['super-admin-activity-logs'],
    async () => {
      const response = await fetch('http://localhost:3001/api/admin/super/activity-logs', {
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

  const filteredLogs = (logs || []).filter((log) => {
    const matchesSearch = 
      log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    
    return matchesSearch && matchesSeverity;
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      info: 'bg-blue-100 text-blue-700 border-blue-200',
      warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      error: 'bg-red-100 text-red-700 border-red-200',
      critical: 'bg-red-100 text-red-900 border-red-300',
    };
    return colors[severity as keyof typeof colors] || colors.info;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl">
              <Activity className="w-6 h-6 text-white" />
            </div>
            Complete Activity Logs
          </h1>
          <p className="text-gray-600 mt-1">
            {filteredLogs.length} log{filteredLogs.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
          <Download className="w-4 h-4" />
          Export Full Logs
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Severity</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Timeline */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Activity Timeline</h2>
          
          <div className="space-y-3">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                  <div className="flex-shrink-0 mt-1">
                    {getSeverityIcon(log.severity)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold border ${getSeverityBadge(log.severity)}`}>
                        {log.severity.toUpperCase()}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {log.action} - {log.resource}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-600 mb-2">
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
                      {log.userAgent && (
                        <div className="text-gray-500 truncate">
                          {log.userAgent.substring(0, 30)}...
                        </div>
                      )}
                    </div>
                    
                    {log.details && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-700 font-mono">{log.details}</p>
                      </div>
                    )}
                  </div>
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

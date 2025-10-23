/**
 * Super Admin System Settings Page
 * System-wide configuration and advanced settings
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings, 
  Save,
  Database,
  Server,
  Shield,
  Mail,
  AlertTriangle
} from 'lucide-react';

import { useAuth } from '@/lib/hooks/useAuth';
import { LoadingSpinner } from '@/components/shared';

export default function SuperAdminSettingsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  React.useEffect(() => {
    if (!authLoading && user && user.role !== 'super_admin') {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return <LoadingSpinner fullScreen text="Loading settings..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl">
            <Settings className="w-6 h-6 text-white" />
          </div>
          System Configuration
        </h1>
        <p className="text-gray-600 mt-1">Manage system-wide settings and configurations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database Configuration */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Database</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Connection String
              </label>
              <input
                type="text"
                defaultValue="postgresql://zenvoyer:***@localhost:5432/zenvoyer_db"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                disabled
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pool Size
                </label>
                <input
                  type="number"
                  defaultValue="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timeout (ms)
                </label>
                <input
                  type="number"
                  defaultValue="5000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Server Configuration */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Server className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Server</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Port
              </label>
              <input
                type="number"
                defaultValue="3001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Request Size
              </label>
              <input
                type="text"
                defaultValue="10mb"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <span className="text-gray-700">Enable CORS</span>
              <input type="checkbox" className="w-4 h-4 text-green-600 rounded" defaultChecked />
            </label>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <Shield className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Security</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                JWT Secret
              </label>
              <input
                type="password"
                defaultValue="your_super_secret_jwt_key"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout (hours)
              </label>
              <input
                type="number"
                defaultValue="24"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <span className="text-gray-700">Rate Limiting</span>
              <input type="checkbox" className="w-4 h-4 text-red-600 rounded" defaultChecked />
            </label>
            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <span className="text-gray-700">IP Whitelist</span>
              <input type="checkbox" className="w-4 h-4 text-red-600 rounded" />
            </label>
          </div>
        </div>

        {/* Email Configuration */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Mail className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Email (SMTP)</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Host
              </label>
              <input
                type="text"
                defaultValue="smtp.sendgrid.net"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Port
                </label>
                <input
                  type="number"
                  defaultValue="587"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Encryption
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                  <option>TLS</option>
                  <option>SSL</option>
                  <option>None</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-red-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="text-lg font-semibold text-red-900">Danger Zone</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-red-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Clear Cache</h3>
            <p className="text-sm text-gray-600 mb-3">Remove all cached data from Redis</p>
            <button className="px-4 py-2 bg-red-100 text-red-700 border border-red-300 rounded-lg hover:bg-red-200 transition-colors font-medium">
              Clear Cache
            </button>
          </div>
          
          <div className="p-4 border border-red-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Reset Database</h3>
            <p className="text-sm text-gray-600 mb-3">Reset database to initial state</p>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
              Reset Database
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
          Cancel
        </button>
        <button className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium flex items-center gap-2">
          <Save className="w-5 h-5" />
          Save Configuration
        </button>
      </div>
    </div>
  );
}

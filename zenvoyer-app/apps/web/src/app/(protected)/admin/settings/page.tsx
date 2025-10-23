/**
 * Admin Settings Page
 * Administrative configuration and preferences
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings, 
  Save,
  Bell,
  Mail,
  Shield,
  Database
} from 'lucide-react';

import { useAuth } from '@/lib/hooks/useAuth';
import { LoadingSpinner } from '@/components/shared';

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  React.useEffect(() => {
    if (!authLoading && user && user.role !== 'admin' && user.role !== 'super_admin') {
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
          <Settings className="w-8 h-8 text-indigo-600" />
          Admin Settings
        </h1>
        <p className="text-gray-600 mt-1">Configure administrative preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <span className="text-gray-700">Email notifications</span>
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" defaultChecked />
            </label>
            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <span className="text-gray-700">New user registrations</span>
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" defaultChecked />
            </label>
            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <span className="text-gray-700">Support ticket updates</span>
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" defaultChecked />
            </label>
          </div>
        </div>

        {/* Email Configuration */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Mail className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Email Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Email
              </label>
              <input
                type="email"
                defaultValue="admin@zenvoyer.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Support Email
              </label>
              <input
                type="email"
                defaultValue="support@zenvoyer.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <Shield className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Security</h2>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <span className="text-gray-700">Two-factor authentication</span>
              <input type="checkbox" className="w-4 h-4 text-red-600 rounded" />
            </label>
            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <span className="text-gray-700">Force password reset</span>
              <input type="checkbox" className="w-4 h-4 text-red-600 rounded" />
            </label>
            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <span className="text-gray-700">Session timeout (30 min)</span>
              <input type="checkbox" className="w-4 h-4 text-red-600 rounded" defaultChecked />
            </label>
          </div>
        </div>

        {/* System */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Database className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">System</h2>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <span className="text-gray-700">Maintenance mode</span>
              <input type="checkbox" className="w-4 h-4 text-green-600 rounded" />
            </label>
            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <span className="text-gray-700">Debug mode</span>
              <input type="checkbox" className="w-4 h-4 text-green-600 rounded" />
            </label>
            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <span className="text-gray-700">Auto backup</span>
              <input type="checkbox" className="w-4 h-4 text-green-600 rounded" defaultChecked />
            </label>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2">
          <Save className="w-5 h-5" />
          Save Settings
        </button>
      </div>
    </div>
  );
}

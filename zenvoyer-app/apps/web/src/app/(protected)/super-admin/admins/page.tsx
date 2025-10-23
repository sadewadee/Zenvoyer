/**
 * Super Admin - Admin Management Page
 * Manage administrator accounts and permissions
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  Search, 
  UserPlus,
  Edit,
  Trash2,
  Mail,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';

import { useAuth } from '@/lib/hooks/useAuth';
import { useApi } from '@/lib/hooks/useApi';
import { LoadingSpinner } from '@/components/shared';

interface Admin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'super_admin';
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export default function SuperAdminAdminsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  React.useEffect(() => {
    if (!authLoading && user && user.role !== 'super_admin') {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const { data: admins, isLoading, refetch } = useApi<Admin[]>(
    ['super-admin-admins'],
    async () => {
      const response = await fetch('http://localhost:3001/api/admin/super/admins', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch admins');
      return response.json();
    }
  );

  if (authLoading || isLoading) {
    return <LoadingSpinner fullScreen text="Loading administrators..." />;
  }

  const filteredAdmins = (admins || []).filter((admin) => {
    const matchesSearch = 
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm('Are you sure you want to remove this administrator?')) return;
    
    try {
      await fetch(`http://localhost:3001/api/admin/super/admins/${adminId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      refetch();
    } catch (err) {
      alert('Failed to remove administrator');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
            Administrator Management
          </h1>
          <p className="text-gray-600 mt-1">
            {filteredAdmins.length} administrator{filteredAdmins.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
          <UserPlus className="w-4 h-4" />
          Add Admin
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">Super Admins</p>
              <p className="text-2xl font-bold text-gray-900">
                {admins?.filter(a => a.role === 'super_admin').length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-gray-900">
                {admins?.filter(a => a.role === 'admin').length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {admins?.filter(a => a.isActive).length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search administrators..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Admins List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Administrator</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Last Login</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAdmins.length > 0 ? (
                filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${admin.role === 'super_admin' ? 'from-red-500 to-red-600' : 'from-purple-500 to-purple-600'} rounded-full flex items-center justify-center text-white font-semibold`}>
                          {admin.firstName[0]}{admin.lastName[0]}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{admin.firstName} {admin.lastName}</div>
                          <div className="text-xs text-gray-500">ID: {admin.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{admin.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${admin.role === 'super_admin' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-purple-100 text-purple-700 border-purple-200'}`}>
                        <Shield className="w-3 h-3" />
                        {admin.role === 'super_admin' ? 'SUPER ADMIN' : 'ADMIN'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {admin.isActive ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3" />
                          ACTIVE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                          <XCircle className="w-3 h-3" />
                          INACTIVE
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'Never'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit admin"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {admin.role !== 'super_admin' && (
                          <button
                            onClick={() => handleDeleteAdmin(admin.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove admin"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No administrators found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

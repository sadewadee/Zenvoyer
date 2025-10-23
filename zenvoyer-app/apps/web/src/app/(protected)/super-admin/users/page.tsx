/**
 * Super Admin Users Management Page
 * Full user management with ban/unban functionality
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Search, 
  Filter,
  Shield,
  Ban,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Mail,
  Calendar,
  DollarSign
} from 'lucide-react';

import { useAuth } from '@/lib/hooks/useAuth';
import { useApi } from '@/lib/hooks/useApi';
import { LoadingSpinner } from '@/components/shared';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isBanned?: boolean;
  createdAt: string;
  subscription?: {
    plan: string;
    status: string;
  };
}

export default function SuperAdminUsersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  React.useEffect(() => {
    if (!authLoading && user && user.role !== 'super_admin') {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const { data: users, isLoading, error, refetch } = useApi<User[]>(
    ['super-admin-users'],
    async () => {
      const response = await fetch('http://localhost:3001/api/admin/super/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    }
  );

  if (authLoading || isLoading) {
    return <LoadingSpinner fullScreen text="Loading users..." />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Failed to load users. Please try again.
        </div>
      </div>
    );
  }

  const filteredUsers = (users || []).filter((u) => {
    const matchesSearch = 
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'banned' && u.isBanned) ||
      (statusFilter === 'active' && !u.isBanned);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleBanUser = async (userId: string) => {
    if (!confirm('Are you sure you want to ban this user?')) return;
    
    try {
      await fetch(`http://localhost:3001/api/admin/super/users/${userId}/ban`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      refetch();
    } catch (err) {
      alert('Failed to ban user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to DELETE this user? This action cannot be undone!')) return;
    
    try {
      await fetch(`http://localhost:3001/api/admin/super/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      refetch();
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      super_admin: 'bg-red-100 text-red-700 border-red-200',
      admin: 'bg-purple-100 text-purple-700 border-purple-200',
      user: 'bg-blue-100 text-blue-700 border-blue-200',
      sub_user: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[role as keyof typeof colors] || colors.user;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
            Full User Management
          </h1>
          <p className="text-gray-600 mt-1">
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users?.length || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {users?.filter(u => !u.isBanned).length || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <Ban className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">Banned</p>
              <p className="text-2xl font-bold text-gray-900">
                {users?.filter(u => u.isBanned).length || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Pro Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {users?.filter(u => u.subscription?.plan === 'pro').length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Joined</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${u.isBanned ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {u.firstName[0]}{u.lastName[0]}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{u.firstName} {u.lastName}</div>
                          <div className="text-xs text-gray-500">ID: {u.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadge(u.role)}`}>
                        <Shield className="w-3 h-3" />
                        {u.role.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {u.isBanned ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                          <XCircle className="w-3 h-3" />
                          BANNED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3" />
                          ACTIVE
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {new Date(u.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit user"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleBanUser(u.id)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title={u.isBanned ? 'Unban user' : 'Ban user'}
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No users found
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

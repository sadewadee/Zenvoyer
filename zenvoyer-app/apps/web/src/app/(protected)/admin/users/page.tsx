/**
 * Admin Users Management Page
 * View and manage all users in the system
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Search, 
  Filter,
  Mail,
  Shield,
  Ban,
  Edit,
  Trash2
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
  createdAt: string;
  subscription?: {
    plan: string;
    status: string;
  };
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  React.useEffect(() => {
    if (!authLoading && user && user.role !== 'admin' && user.role !== 'super_admin') {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const { data: users, isLoading, error } = useApi<User[]>(
    ['admin-users'],
    async () => {
      const response = await fetch('http://localhost:3001/api/admin/users', {
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
    
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    const colors = {
      super_admin: 'bg-red-100 text-red-700 border-red-200',
      admin: 'bg-purple-100 text-purple-700 border-purple-200',
      user: 'bg-blue-100 text-blue-700 border-blue-200',
      sub_user: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[role as keyof typeof colors] || colors.user;
  };

  const getPlanBadge = (plan?: string) => {
    if (!plan) return null;
    const colors = {
      pro: 'bg-green-100 text-green-700',
      free: 'bg-gray-100 text-gray-700',
    };
    return colors[plan as keyof typeof colors] || colors.free;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            User Management
          </h1>
          <p className="text-gray-600 mt-1">
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
              <option value="sub_user">Sub User</option>
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {u.firstName[0]}{u.lastName[0]}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {u.firstName} {u.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {u.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {u.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadge(u.role)}`}>
                        <Shield className="w-3 h-3" />
                        {u.role.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {u.subscription?.plan ? (
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getPlanBadge(u.subscription.plan)}`}>
                          {u.subscription.plan.toUpperCase()}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(u.createdAt).toLocaleDateString()}
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
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Ban user"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                        <button
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
                    No users found matching your criteria
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

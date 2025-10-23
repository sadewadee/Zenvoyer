/**
 * Admin Support Tickets Page
 * Manage and respond to support requests
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Search, 
  Filter,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Calendar
} from 'lucide-react';

import { useAuth } from '@/lib/hooks/useAuth';
import { useApi } from '@/lib/hooks/useApi';
import { LoadingSpinner } from '@/components/shared';

interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
}

export default function AdminSupportTicketsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  React.useEffect(() => {
    if (!authLoading && user && user.role !== 'admin' && user.role !== 'super_admin') {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const { data: tickets, isLoading, error } = useApi<SupportTicket[]>(
    ['admin-support-tickets'],
    async () => {
      const response = await fetch('http://localhost:3001/api/admin/support-tickets', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch tickets');
      return response.json();
    }
  );

  if (authLoading || isLoading) {
    return <LoadingSpinner fullScreen text="Loading support tickets..." />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Failed to load support tickets. Please try again.
        </div>
      </div>
    );
  }

  const filteredTickets = (tickets || []).filter((ticket) => {
    const matchesSearch = 
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      open: 'bg-blue-100 text-blue-700 border-blue-200',
      in_progress: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      resolved: 'bg-green-100 text-green-700 border-green-200',
      closed: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[status as keyof typeof colors] || colors.open;
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700',
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="w-4 h-4" />;
      case 'in_progress':
        return <Clock className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'closed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-green-600" />
            Support Tickets
          </h1>
          <p className="text-gray-600 mt-1">
            {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => (
            <div key={ticket.id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(ticket.status)}`}>
                      {getStatusIcon(ticket.status)}
                      {ticket.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getPriorityBadge(ticket.priority)}`}>
                      {ticket.priority.toUpperCase()}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {ticket.subject}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {ticket.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {ticket.userEmail}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  View
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center text-gray-500">
            No support tickets found matching your criteria
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Dashboard API Services
 * Centralized functions untuk dashboard-related API calls
 */

import { get } from '../client';
import { API_ENDPOINTS } from '../../constants';

export interface DashboardStat {
  title: string;
  value: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down';
}

export interface RevenueChartData {
  label: string;
  value: number;
}

export interface StatusChartData {
  label: string;
  value: number;
  percentage: number;
}

export interface TopClient {
  id: string;
  name: string;
  totalInvoices: number;
  totalAmount: number;
}

export interface DashboardInvoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  amount: number;
  status: string;
  dueDate: string;
}

export interface UserDashboardResponse {
  stats: {
    totalInvoices: DashboardStat;
    totalRevenue: DashboardStat;
    totalUnpaid: DashboardStat;
    conversionRate: DashboardStat;
  };
  revenueChart: RevenueChartData[];
  statusChart: StatusChartData[];
  topClients: TopClient[];
  recentInvoices: DashboardInvoice[];
  overdueInvoices: DashboardInvoice[];
}

export interface AdminDashboardResponse {
  stats: Record<string, DashboardStat>;
  charts: Record<string, any[]>;
}

export interface SuperAdminDashboardResponse {
  stats: Record<string, DashboardStat>;
  charts: Record<string, any[]>;
  userGrowth: any[];
  revenueCharts: any[];
}

export const dashboardApi = {
  /**
   * Get user dashboard
   */
  getUserDashboard: () =>
    get<UserDashboardResponse>(API_ENDPOINTS.DASHBOARD_USER),

  /**
   * Get admin dashboard
   */
  getAdminDashboard: () =>
    get<AdminDashboardResponse>(API_ENDPOINTS.DASHBOARD_ADMIN),

  /**
   * Get super admin dashboard
   */
  getSuperAdminDashboard: () =>
    get<SuperAdminDashboardResponse>(API_ENDPOINTS.DASHBOARD_SUPER_ADMIN),
};

export default dashboardApi;

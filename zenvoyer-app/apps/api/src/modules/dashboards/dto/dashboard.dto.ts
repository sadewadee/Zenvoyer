// DTO for dashboard responses are primarily read-only aggregations
// No input DTOs needed for dashboard endpoints

export interface DashboardStats {
  title: string;
  value: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

export interface ChartData {
  label: string;
  value: number;
  percentage?: number;
}

export interface UserDashboardResponse {
  stats: {
    totalInvoices: DashboardStats;
    totalRevenue: DashboardStats;
    totalUnpaid: DashboardStats;
    conversionRate: DashboardStats;
  };
  revenueChart: ChartData[];
  statusChart: ChartData[];
  topClients: Array<{
    id: string;
    name: string;
    totalInvoices: number;
    totalAmount: number;
  }>;
  recentInvoices: Array<{
    id: string;
    invoiceNumber: string;
    clientName: string;
    amount: number;
    status: string;
    dueDate: string;
  }>;
  overdueInvoices: Array<{
    id: string;
    invoiceNumber: string;
    clientName: string;
    daysOverdue: number;
    amount: number;
  }>;
}

export interface AdminDashboardResponse {
  stats: {
    activeTickets: DashboardStats;
    resolvedTickets: DashboardStats;
    averageResolutionTime: DashboardStats;
    customerSatisfaction: DashboardStats;
  };
  recentTickets: Array<{
    id: string;
    userId: string;
    subject: string;
    status: string;
    priority: string;
    createdAt: string;
  }>;
  userActivity: ChartData[];
  supportCategory: ChartData[];
}

export interface SuperAdminDashboardResponse {
  stats: {
    totalUsers: DashboardStats;
    totalRevenue: DashboardStats;
    mrr: DashboardStats;
    churnRate: DashboardStats;
  };
  userGrowth: ChartData[];
  revenueChart: ChartData[];
  planDistribution: ChartData[];
  topPerformingUsers: Array<{
    id: string;
    email: string;
    totalInvoices: number;
    totalRevenue: number;
    subscriptionPlan: string;
  }>;
  systemHealth: {
    databaseStatus: string;
    apiStatus: string;
    cacheStatus: string;
    uptime: string;
  };
}

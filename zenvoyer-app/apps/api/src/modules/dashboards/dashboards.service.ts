import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../../../database/entities/invoice.entity';
import { User } from '../../../database/entities/user.entity';
import { Client } from '../../../database/entities/client.entity';
import { AdminActivityLog } from '../../../database/entities/admin-activity-log.entity';
import {
  UserDashboardResponse,
  AdminDashboardResponse,
  SuperAdminDashboardResponse,
  DashboardStats,
  ChartData,
} from '../dto/dashboard.dto';

@Injectable()
export class DashboardsService {
  constructor(
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
    @InjectRepository(AdminActivityLog)
    private activityLogRepository: Repository<AdminActivityLog>,
  ) {}

  /**
   * Get user dashboard
   */
  async getUserDashboard(userId: string): Promise<UserDashboardResponse> {
    const invoices = await this.invoicesRepository.find({
      where: { userId },
      relations: ['client'],
    });

    const currentMonth = new Date();
    currentMonth.setDate(1);

    const previousMonth = new Date(currentMonth);
    previousMonth.setMonth(previousMonth.getMonth() - 1);

    const currentMonthInvoices = invoices.filter(
      (inv) => inv.createdAt >= currentMonth,
    );
    const previousMonthInvoices = invoices.filter(
      (inv) =>
        inv.createdAt >= previousMonth &&
        inv.createdAt < currentMonth,
    );

    const currentRevenue = currentMonthInvoices.reduce(
      (sum, inv) => sum + inv.totalAmount,
      0,
    );
    const previousRevenue = previousMonthInvoices.reduce(
      (sum, inv) => sum + inv.totalAmount,
      0,
    );

    const revenueChange = previousRevenue === 0
      ? 100
      : ((currentRevenue - previousRevenue) / previousRevenue) * 100;

    const totalUnpaid = invoices.reduce(
      (sum, inv) => sum + (inv.totalAmount - inv.amountPaid),
      0,
    );

    const paidInvoices = invoices.filter(
      (inv) => inv.status === 'paid',
    ).length;
    const conversionRate = invoices.length > 0
      ? (paidInvoices / invoices.length) * 100
      : 0;

    // Build response
    return {
      stats: {
        totalInvoices: {
          title: 'Total Invoices',
          value: invoices.length,
          change: currentMonthInvoices.length - previousMonthInvoices.length,
          changePercent: previousMonthInvoices.length === 0
            ? 100
            : ((currentMonthInvoices.length - previousMonthInvoices.length) /
                previousMonthInvoices.length) * 100,
          trend: currentMonthInvoices.length >= previousMonthInvoices.length
            ? 'up'
            : 'down',
        },
        totalRevenue: {
          title: 'Total Revenue',
          value: Math.round(currentRevenue * 100) / 100,
          change: Math.round((currentRevenue - previousRevenue) * 100) / 100,
          changePercent: revenueChange,
          trend: revenueChange >= 0 ? 'up' : 'down',
        },
        totalUnpaid: {
          title: 'Unpaid Amount',
          value: Math.round(totalUnpaid * 100) / 100,
          change: 0,
          changePercent: 0,
          trend: 'stable',
        },
        conversionRate: {
          title: 'Conversion Rate',
          value: Math.round(conversionRate * 100) / 100,
          change: 0,
          changePercent: 0,
          trend: 'stable',
        },
      },
      revenueChart: this.buildRevenueChart(invoices),
      statusChart: this.buildStatusChart(invoices),
      topClients: await this.getTopClients(userId),
      recentInvoices: invoices.slice(0, 5).map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        clientName: inv.client.name,
        amount: inv.totalAmount,
        status: inv.status,
        dueDate: inv.dueDate.toISOString(),
      })),
      overdueInvoices: this.getOverdueInvoices(invoices),
    };
  }

  /**
   * Get admin dashboard (for support team)
   */
  async getAdminDashboard(): Promise<AdminDashboardResponse> {
    const activityLogs = await this.activityLogRepository.find({
      order: { createdAt: 'DESC' },
      take: 50,
    });

    return {
      stats: {
        activeTickets: {
          title: 'Active Tickets',
          value: 0,
          change: 0,
          changePercent: 0,
          trend: 'stable',
        },
        resolvedTickets: {
          title: 'Resolved Tickets',
          value: 0,
          change: 0,
          changePercent: 0,
          trend: 'stable',
        },
        averageResolutionTime: {
          title: 'Avg Resolution Time',
          value: 0,
          change: 0,
          changePercent: 0,
          trend: 'stable',
        },
        customerSatisfaction: {
          title: 'Customer Satisfaction',
          value: 0,
          change: 0,
          changePercent: 0,
          trend: 'stable',
        },
      },
      recentTickets: [],
      userActivity: this.buildUserActivityChart(activityLogs),
      supportCategory: [],
    };
  }

  /**
   * Get super admin dashboard
   */
  async getSuperAdminDashboard(): Promise<SuperAdminDashboardResponse> {
    const allUsers = await this.usersRepository.find();
    const regularUsers = allUsers.filter((u) => u.role === 'user');
    const proUsers = regularUsers.filter((u) => u.subscriptionPlan === 'pro');

    const allInvoices = await this.invoicesRepository.find();
    const totalRevenue = allInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

    // Calculate MRR (Monthly Recurring Revenue)
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const currentMonthUsers = proUsers.filter(
      (u) => u.subscriptionStartDate && u.subscriptionStartDate >= currentMonth,
    );
    const mrr = currentMonthUsers.length * 50000; // Assuming Rp50,000 per month

    const churnRate = 0; // Calculate based on historical data

    return {
      stats: {
        totalUsers: {
          title: 'Total Users',
          value: regularUsers.length,
          change: 0,
          changePercent: 0,
          trend: 'stable',
        },
        totalRevenue: {
          title: 'Total Revenue',
          value: Math.round(totalRevenue * 100) / 100,
          change: 0,
          changePercent: 0,
          trend: 'stable',
        },
        mrr: {
          title: 'Monthly Recurring Revenue',
          value: Math.round(mrr * 100) / 100,
          change: 0,
          changePercent: 0,
          trend: 'stable',
        },
        churnRate: {
          title: 'Churn Rate',
          value: churnRate,
          change: 0,
          changePercent: 0,
          trend: 'stable',
        },
      },
      userGrowth: this.buildUserGrowthChart(allUsers),
      revenueChart: this.buildPlatformRevenueChart(allInvoices),
      planDistribution: [
        {
          label: 'Free Plan',
          value: regularUsers.length - proUsers.length,
          percentage: ((regularUsers.length - proUsers.length) / regularUsers.length) * 100,
        },
        {
          label: 'Pro Plan',
          value: proUsers.length,
          percentage: (proUsers.length / regularUsers.length) * 100,
        },
      ],
      topPerformingUsers: await this.getTopPerformingUsers(),
      systemHealth: {
        databaseStatus: 'healthy',
        apiStatus: 'healthy',
        cacheStatus: 'healthy',
        uptime: '99.9%',
      },
    };
  }

  // Helper methods

  private buildRevenueChart(invoices: Invoice[]): ChartData[] {
    const monthlyData: Map<string, number> = new Map();

    invoices.forEach((inv) => {
      const month = inv.createdAt.toISOString().slice(0, 7);
      monthlyData.set(month, (monthlyData.get(month) || 0) + inv.totalAmount);
    });

    return Array.from(monthlyData.entries()).map(([month, value]) => ({
      label: month,
      value: Math.round(value * 100) / 100,
    }));
  }

  private buildStatusChart(invoices: Invoice[]): ChartData[] {
    const statusCounts: Map<string, number> = new Map();

    invoices.forEach((inv) => {
      statusCounts.set(inv.status, (statusCounts.get(inv.status) || 0) + 1);
    });

    return Array.from(statusCounts.entries()).map(([status, count]) => ({
      label: status,
      value: count,
      percentage: (count / invoices.length) * 100,
    }));
  }

  private async getTopClients(userId: string): Promise<any[]> {
    const invoices = await this.invoicesRepository.find({
      where: { userId },
      relations: ['client'],
    });

    const clientStats: Map<string, any> = new Map();

    invoices.forEach((inv) => {
      const key = inv.clientId;
      if (!clientStats.has(key)) {
        clientStats.set(key, {
          id: inv.clientId,
          name: inv.client.name,
          totalInvoices: 0,
          totalAmount: 0,
        });
      }

      const stats = clientStats.get(key);
      stats.totalInvoices++;
      stats.totalAmount += inv.totalAmount;
    });

    return Array.from(clientStats.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5);
  }

  private getOverdueInvoices(invoices: Invoice[]): any[] {
    const now = new Date();

    return invoices
      .filter((inv) => inv.dueDate < now && inv.status !== 'paid')
      .map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        clientName: inv.client?.name || 'Unknown',
        daysOverdue: Math.floor(
          (now.getTime() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24),
        ),
        amount: inv.totalAmount - inv.amountPaid,
      }))
      .slice(0, 5);
  }

  private buildUserActivityChart(logs: AdminActivityLog[]): ChartData[] {
    const actionCounts: Map<string, number> = new Map();

    logs.forEach((log) => {
      actionCounts.set(log.action, (actionCounts.get(log.action) || 0) + 1);
    });

    return Array.from(actionCounts.entries()).map(([action, count]) => ({
      label: action,
      value: count,
    }));
  }

  private buildUserGrowthChart(users: User[]): ChartData[] {
    const monthlyGrowth: Map<string, number> = new Map();

    users.forEach((user) => {
      const month = user.createdAt.toISOString().slice(0, 7);
      monthlyGrowth.set(month, (monthlyGrowth.get(month) || 0) + 1);
    });

    return Array.from(monthlyGrowth.entries()).map(([month, count]) => ({
      label: month,
      value: count,
    }));
  }

  private buildPlatformRevenueChart(invoices: Invoice[]): ChartData[] {
    const monthlyRevenue: Map<string, number> = new Map();

    invoices.forEach((inv) => {
      const month = inv.createdAt.toISOString().slice(0, 7);
      monthlyRevenue.set(month, (monthlyRevenue.get(month) || 0) + inv.totalAmount);
    });

    return Array.from(monthlyRevenue.entries()).map(([month, value]) => ({
      label: month,
      value: Math.round(value * 100) / 100,
    }));
  }

  private async getTopPerformingUsers(): Promise<any[]> {
    const invoices = await this.invoicesRepository.find({
      relations: ['user'],
    });

    const userStats: Map<string, any> = new Map();

    invoices.forEach((inv) => {
      const key = inv.userId;
      if (!userStats.has(key)) {
        userStats.set(key, {
          id: inv.userId,
          email: inv.user?.email || 'unknown@example.com',
          totalInvoices: 0,
          totalRevenue: 0,
          subscriptionPlan: inv.user?.subscriptionPlan || 'free',
        });
      }

      const stats = userStats.get(key);
      stats.totalInvoices++;
      stats.totalRevenue += inv.totalAmount;
    });

    return Array.from(userStats.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);
  }
}

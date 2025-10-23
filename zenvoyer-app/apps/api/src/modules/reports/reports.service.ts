import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Invoice, InvoiceStatus } from '../../database/entities/invoice.entity';
import { Payment } from '../../database/entities/invoice.entity';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface ProfitLossReport {
  period: DateRange;
  revenue: {
    total: number;
    paid: number;
    pending: number;
  };
  expenses: {
    total: number;
    itemsCost: number;
  };
  profit: {
    gross: number;
    net: number;
    margin: number;
  };
  invoiceCount: {
    total: number;
    paid: number;
    unpaid: number;
    overdue: number;
  };
}

export interface TaxSummary {
  period: DateRange;
  taxCollected: number;
  taxableAmount: number;
  averageTaxRate: number;
  invoicesWithTax: number;
  totalInvoices: number;
  taxByMonth: Array<{
    month: string;
    taxCollected: number;
    invoiceCount: number;
  }>;
}

export interface ClientRevenueReport {
  clientId: string;
  clientName: string;
  totalRevenue: number;
  invoiceCount: number;
  averageInvoiceAmount: number;
  lastInvoiceDate: Date;
  status: 'active' | 'inactive';
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
  ) {}

  /**
   * Generate Profit & Loss Report
   */
  async generateProfitLossReport(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ProfitLossReport> {
    const invoices = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.items', 'items')
      .where('invoice.userId = :userId', { userId })
      .andWhere('invoice.invoiceDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getMany();

    // Calculate revenue
    const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
    const paidRevenue = invoices
      .filter((inv) => inv.status === InvoiceStatus.PAID)
      .reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
    const pendingRevenue = totalRevenue - paidRevenue;

    // Calculate expenses (simplified - based on cost price if available)
    const totalExpenses = invoices.reduce((sum, inv) => {
      return sum + (Number(inv.profitMargin) || 0);
    }, 0);

    // Calculate profit
    const grossProfit = totalRevenue - totalExpenses;
    const netProfit = paidRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    // Count invoices by status
    const totalCount = invoices.length;
    const paidCount = invoices.filter((inv) => inv.status === InvoiceStatus.PAID).length;
    const unpaidCount = invoices.filter(
      (inv) =>
        inv.status === InvoiceStatus.SENT ||
        inv.status === InvoiceStatus.VIEWED ||
        inv.status === InvoiceStatus.PARTIAL,
    ).length;
    const overdueCount = invoices.filter((inv) => inv.status === InvoiceStatus.OVERDUE).length;

    return {
      period: { startDate, endDate },
      revenue: {
        total: Math.round(totalRevenue * 100) / 100,
        paid: Math.round(paidRevenue * 100) / 100,
        pending: Math.round(pendingRevenue * 100) / 100,
      },
      expenses: {
        total: Math.round(totalExpenses * 100) / 100,
        itemsCost: Math.round(totalExpenses * 100) / 100,
      },
      profit: {
        gross: Math.round(grossProfit * 100) / 100,
        net: Math.round(netProfit * 100) / 100,
        margin: Math.round(profitMargin * 100) / 100,
      },
      invoiceCount: {
        total: totalCount,
        paid: paidCount,
        unpaid: unpaidCount,
        overdue: overdueCount,
      },
    };
  }

  /**
   * Generate Tax Summary Report
   */
  async generateTaxSummary(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<TaxSummary> {
    const invoices = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .where('invoice.userId = :userId', { userId })
      .andWhere('invoice.invoiceDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getMany();

    // Calculate tax totals
    const totalTaxCollected = invoices.reduce((sum, inv) => sum + Number(inv.taxAmount), 0);
    const totalTaxableAmount = invoices.reduce((sum, inv) => sum + Number(inv.subtotal), 0);
    const invoicesWithTax = invoices.filter((inv) => Number(inv.taxAmount) > 0).length;
    const averageTaxRate =
      invoicesWithTax > 0
        ? invoices.reduce((sum, inv) => sum + Number(inv.taxRate), 0) / invoicesWithTax
        : 0;

    // Group by month
    const taxByMonth: { [key: string]: { tax: number; count: number } } = {};
    
    invoices.forEach((invoice) => {
      const monthKey = invoice.invoiceDate.toISOString().substring(0, 7); // YYYY-MM
      if (!taxByMonth[monthKey]) {
        taxByMonth[monthKey] = { tax: 0, count: 0 };
      }
      taxByMonth[monthKey].tax += Number(invoice.taxAmount);
      taxByMonth[monthKey].count++;
    });

    const taxByMonthArray = Object.entries(taxByMonth).map(([month, data]) => ({
      month,
      taxCollected: Math.round(data.tax * 100) / 100,
      invoiceCount: data.count,
    }));

    return {
      period: { startDate, endDate },
      taxCollected: Math.round(totalTaxCollected * 100) / 100,
      taxableAmount: Math.round(totalTaxableAmount * 100) / 100,
      averageTaxRate: Math.round(averageTaxRate * 100) / 100,
      invoicesWithTax,
      totalInvoices: invoices.length,
      taxByMonth: taxByMonthArray.sort((a, b) => a.month.localeCompare(b.month)),
    };
  }

  /**
   * Generate Client Revenue Report
   */
  async generateClientRevenueReport(userId: string): Promise<ClientRevenueReport[]> {
    const results = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .leftJoin('invoice.client', 'client')
      .where('invoice.userId = :userId', { userId })
      .select('invoice.clientId', 'clientId')
      .addSelect('client.name', 'clientName')
      .addSelect('SUM(invoice.totalAmount)', 'totalRevenue')
      .addSelect('COUNT(invoice.id)', 'invoiceCount')
      .addSelect('AVG(invoice.totalAmount)', 'averageInvoiceAmount')
      .addSelect('MAX(invoice.invoiceDate)', 'lastInvoiceDate')
      .groupBy('invoice.clientId')
      .addGroupBy('client.name')
      .orderBy('totalRevenue', 'DESC')
      .getRawMany();

    return results.map((result) => ({
      clientId: result.clientId,
      clientName: result.clientName,
      totalRevenue: Math.round(Number(result.totalRevenue) * 100) / 100,
      invoiceCount: Number(result.invoiceCount),
      averageInvoiceAmount: Math.round(Number(result.averageInvoiceAmount) * 100) / 100,
      lastInvoiceDate: new Date(result.lastInvoiceDate),
      status: this.getClientStatus(new Date(result.lastInvoiceDate)),
    }));
  }

  /**
   * Generate Revenue Trend (monthly breakdown)
   */
  async generateRevenueTrend(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Array<{ month: string; revenue: number; invoiceCount: number }>> {
    const invoices = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .where('invoice.userId = :userId', { userId })
      .andWhere('invoice.invoiceDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getMany();

    const revenueByMonth: { [key: string]: { revenue: number; count: number } } = {};

    invoices.forEach((invoice) => {
      const monthKey = invoice.invoiceDate.toISOString().substring(0, 7);
      if (!revenueByMonth[monthKey]) {
        revenueByMonth[monthKey] = { revenue: 0, count: 0 };
      }
      if (invoice.status === InvoiceStatus.PAID) {
        revenueByMonth[monthKey].revenue += Number(invoice.totalAmount);
      }
      revenueByMonth[monthKey].count++;
    });

    return Object.entries(revenueByMonth)
      .map(([month, data]) => ({
        month,
        revenue: Math.round(data.revenue * 100) / 100,
        invoiceCount: data.count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  private getClientStatus(lastInvoiceDate: Date): 'active' | 'inactive' {
    const daysSinceLastInvoice = Math.floor(
      (Date.now() - lastInvoiceDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysSinceLastInvoice <= 90 ? 'active' : 'inactive';
  }
}

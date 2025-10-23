import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  Invoice,
  InvoiceItem,
  Payment,
  InvoiceStatus,
} from '../../database/entities/invoice.entity';
import { Client } from '../../database/entities/client.entity';
import { PaginationDto, createPaginatedResult } from '../../common/dto/pagination.dto';
import {
  CreateInvoiceDto,
  UpdateInvoiceDto,
  RecordPaymentDto,
  UpdateInvoiceStatusDto,
} from './dto/invoice.dto';
import { InvoiceCalculationService } from './services/invoice-calculation.service';
import { InvoiceNumberingService } from './services/invoice-numbering.service';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private invoiceItemsRepository: Repository<InvoiceItem>,
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
    private calculationService: InvoiceCalculationService,
    private numberingService: InvoiceNumberingService,
  ) {}

  /**
   * Get all invoices for a user with pagination
   */
  async getAllInvoices(userId: string, paginationDto: PaginationDto, filters?: any) {
    const { page, limit, skip } = paginationDto;

    const query = this.invoicesRepository
      .createQueryBuilder('invoice')
      .where('invoice.userId = :userId', { userId })
      .leftJoinAndSelect('invoice.client', 'client')
      .leftJoinAndSelect('invoice.items', 'items')
      .orderBy('invoice.invoiceDate', 'DESC');

    // Apply filters
    if (filters?.status) {
      query.andWhere('invoice.status = :status', { status: filters.status });
    }

    if (filters?.clientId) {
      query.andWhere('invoice.clientId = :clientId', { clientId: filters.clientId });
    }

    if (filters?.dateFrom) {
      query.andWhere('invoice.invoiceDate >= :dateFrom', {
        dateFrom: filters.dateFrom,
      });
    }

    if (filters?.dateTo) {
      query.andWhere('invoice.invoiceDate <= :dateTo', { dateTo: filters.dateTo });
    }

    // Search by invoice number or client name
    if (filters?.search) {
      query.andWhere(
        '(invoice.invoiceNumber ILIKE :search OR client.name ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    // Amount filters
    if (filters?.minAmount) {
      query.andWhere('invoice.totalAmount >= :minAmount', { minAmount: filters.minAmount });
    }

    if (filters?.maxAmount) {
      query.andWhere('invoice.totalAmount <= :maxAmount', { maxAmount: filters.maxAmount });
    }

    // Apply pagination
    const [data, total] = await query.take(limit).skip(skip).getManyAndCount();

    return createPaginatedResult(data, total, page, limit);
  }

  /**
   * Get single invoice by ID
   */
  async getInvoiceById(userId: string, invoiceId: string) {
    const invoice = await this.invoicesRepository.findOne({
      where: { id: invoiceId, userId },
      relations: ['client', 'items', 'payments'],
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  /**
   * Create a new invoice
   */
  async createInvoice(userId: string, createInvoiceDto: CreateInvoiceDto) {
    // Verify client belongs to user
    const client = await this.clientsRepository.findOne({
      where: { id: createInvoiceDto.clientId, userId },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // Validate items
    if (!this.calculationService.validateItems(createInvoiceDto.items)) {
      throw new BadRequestException('Invalid invoice items');
    }

    // Calculate totals
    const taxRate = createInvoiceDto.taxRate || 0;
    const discountRate = createInvoiceDto.discountRate || 0;
    const calculations = this.calculationService.calculateTotals(
      createInvoiceDto.items,
      taxRate,
      discountRate,
    );

    // Generate invoice number
    const invoiceNumber =
      createInvoiceDto.invoiceNumber ||
      (await this.numberingService.generateInvoiceNumber(userId));

    // Create invoice
    const invoice = this.invoicesRepository.create({
      userId,
      clientId: createInvoiceDto.clientId,
      invoiceNumber,
      invoiceDate: createInvoiceDto.invoiceDate,
      dueDate: createInvoiceDto.dueDate,
      currency: createInvoiceDto.currency || 'USD',
      ...calculations,
      taxRate,
      discountRate,
      notes: createInvoiceDto.notes,
      termsAndConditions: createInvoiceDto.termsAndConditions,
      status: InvoiceStatus.DRAFT,
      amountPaid: 0,
    });

    const savedInvoice = await this.invoicesRepository.save(invoice);

    // Create invoice items
    const items = createInvoiceDto.items.map((item) =>
      this.invoiceItemsRepository.create({
        invoiceId: savedInvoice.id,
        productId: item.productId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice,
      }),
    );

    await this.invoiceItemsRepository.save(items);
    savedInvoice.items = items;

    return savedInvoice;
  }

  /**
   * Update invoice (only if draft)
   */
  async updateInvoice(
    userId: string,
    invoiceId: string,
    updateInvoiceDto: UpdateInvoiceDto,
  ) {
    const invoice = await this.getInvoiceById(userId, invoiceId);

    // Only allow updates to draft invoices
    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Can only edit draft invoices');
    }

    // Update basic fields
    if (updateInvoiceDto.invoiceDate) {
      invoice.invoiceDate = updateInvoiceDto.invoiceDate;
    }
    if (updateInvoiceDto.dueDate) {
      invoice.dueDate = updateInvoiceDto.dueDate;
    }
    if (updateInvoiceDto.notes !== undefined) {
      invoice.notes = updateInvoiceDto.notes;
    }
    if (updateInvoiceDto.termsAndConditions !== undefined) {
      invoice.termsAndConditions = updateInvoiceDto.termsAndConditions;
    }

    // If items are updated, recalculate totals
    if (updateInvoiceDto.items && updateInvoiceDto.items.length > 0) {
      // Delete old items
      await this.invoiceItemsRepository.delete({ invoiceId });

      // Validate new items
      if (!this.calculationService.validateItems(updateInvoiceDto.items)) {
        throw new BadRequestException('Invalid invoice items');
      }

      // Recalculate totals
      const taxRate = updateInvoiceDto.taxRate ?? invoice.taxRate;
      const discountRate = updateInvoiceDto.discountRate ?? invoice.discountRate;
      const calculations = this.calculationService.calculateTotals(
        updateInvoiceDto.items,
        taxRate,
        discountRate,
      );

      // Update calculations
      invoice.subtotal = calculations.subtotal;
      invoice.taxAmount = calculations.taxAmount;
      invoice.discountAmount = calculations.discountAmount;
      invoice.totalAmount = calculations.total;
      invoice.taxRate = taxRate;
      invoice.discountRate = discountRate;

      // Create new items
      const newItems = updateInvoiceDto.items.map((item) =>
        this.invoiceItemsRepository.create({
          invoiceId: invoice.id,
          productId: item.productId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
        }),
      );

      await this.invoiceItemsRepository.save(newItems);
      invoice.items = newItems;
    } else {
      // Update tax/discount rates if provided
      if (updateInvoiceDto.taxRate !== undefined || updateInvoiceDto.discountRate !== undefined) {
        const taxRate = updateInvoiceDto.taxRate ?? invoice.taxRate;
        const discountRate = updateInvoiceDto.discountRate ?? invoice.discountRate;

        const calculations = this.calculationService.calculateTotals(
          invoice.items,
          taxRate,
          discountRate,
        );

        invoice.subtotal = calculations.subtotal;
        invoice.taxAmount = calculations.taxAmount;
        invoice.discountAmount = calculations.discountAmount;
        invoice.totalAmount = calculations.total;
        invoice.taxRate = taxRate;
        invoice.discountRate = discountRate;
      }
    }

    return this.invoicesRepository.save(invoice);
  }

  /**
   * Send invoice (change status from draft to sent)
   */
  async sendInvoice(userId: string, invoiceId: string) {
    const invoice = await this.getInvoiceById(userId, invoiceId);

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Can only send draft invoices');
    }

    invoice.status = InvoiceStatus.SENT;
    return this.invoicesRepository.save(invoice);
  }

  /**
   * Mark invoice as viewed (for public links)
   */
  async markInvoiceAsViewed(invoiceId: string) {
    const invoice = await this.invoicesRepository.findOne({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status === InvoiceStatus.SENT) {
      invoice.status = InvoiceStatus.VIEWED;
      invoice.viewedAt = new Date();
    }

    return this.invoicesRepository.save(invoice);
  }

  /**
   * Record a payment for invoice
   */
  async recordPayment(
    userId: string,
    invoiceId: string,
    recordPaymentDto: RecordPaymentDto,
  ) {
    const invoice = await this.getInvoiceById(userId, invoiceId);

    if (recordPaymentDto.amount <= 0) {
      throw new BadRequestException('Payment amount must be greater than 0');
    }

    const remainingAmount = this.calculationService.calculateRemainingAmount(
      invoice.totalAmount,
      invoice.amountPaid,
    );

    if (recordPaymentDto.amount > remainingAmount) {
      throw new BadRequestException(
        `Payment amount exceeds remaining balance of ${remainingAmount}`,
      );
    }

    // Create payment record
    const payment = this.paymentsRepository.create({
      invoiceId,
      ...recordPaymentDto,
      status: 'completed',
    });

    await this.paymentsRepository.save(payment);

    // Update invoice amount paid
    invoice.amountPaid += recordPaymentDto.amount;

    // Update invoice status
    const newStatus = this.calculationService.determineInvoiceStatus(
      invoice.totalAmount,
      invoice.amountPaid,
      invoice.dueDate,
    );
    invoice.status = newStatus as any;

    return this.invoicesRepository.save(invoice);
  }

  /**
   * Update invoice status
   */
  async updateInvoiceStatus(
    userId: string,
    invoiceId: string,
    updateStatusDto: UpdateInvoiceStatusDto,
  ) {
    const invoice = await this.getInvoiceById(userId, invoiceId);

    const validStatuses = ['draft', 'sent', 'viewed', 'paid', 'partial', 'overdue'];
    if (!validStatuses.includes(updateStatusDto.status)) {
      throw new BadRequestException('Invalid invoice status');
    }

    invoice.status = updateStatusDto.status as any;
    return this.invoicesRepository.save(invoice);
  }

  /**
   * Delete invoice (only draft)
   */
  async deleteInvoice(userId: string, invoiceId: string) {
    const invoice = await this.getInvoiceById(userId, invoiceId);

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Can only delete draft invoices');
    }

    // Delete items and payments
    await this.invoiceItemsRepository.delete({ invoiceId });
    await this.paymentsRepository.delete({ invoiceId });
    await this.invoicesRepository.delete(invoiceId);

    return { message: 'Invoice deleted successfully' };
  }

  /**
   * Generate public share link token
   */
  async generateShareLink(userId: string, invoiceId: string, expiresInDays: number = 30) {
    const invoice = await this.getInvoiceById(userId, invoiceId);

    // Generate random token
    const token = require('crypto').randomBytes(32).toString('hex');

    // Set expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    invoice.publicShareToken = token;
    invoice.isPubliclyShared = true;
    invoice.publicShareExpiresAt = expiresAt;

    await this.invoicesRepository.save(invoice);

    return {
      shareToken: token,
      expiresAt,
      shareUrl: `/api/invoices/public/${token}`,
    };
  }

  /**
   * Get invoice by public share token
   */
  async getPublicInvoice(shareToken: string) {
    const invoice = await this.invoicesRepository.findOne({
      where: { publicShareToken: shareToken, isPubliclyShared: true },
      relations: ['client', 'items'],
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Check if link has expired
    if (invoice.publicShareExpiresAt && invoice.publicShareExpiresAt < new Date()) {
      throw new BadRequestException('This share link has expired');
    }

    // Mark as viewed
    await this.markInvoiceAsViewed(invoice.id);

    return invoice;
  }

  /**
   * Get invoice statistics for dashboard
   */
  async getInvoiceStatistics(userId: string) {
    const invoices = await this.invoicesRepository.find({
      where: { userId },
    });

    const totalInvoices = invoices.length;
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalPaid = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
    const totalUnpaid = totalAmount - totalPaid;

    const statusCounts = {
      draft: invoices.filter((inv) => inv.status === InvoiceStatus.DRAFT).length,
      sent: invoices.filter((inv) => inv.status === InvoiceStatus.SENT).length,
      viewed: invoices.filter((inv) => inv.status === InvoiceStatus.VIEWED).length,
      paid: invoices.filter((inv) => inv.status === InvoiceStatus.PAID).length,
      partial: invoices.filter((inv) => inv.status === InvoiceStatus.PARTIAL).length,
      overdue: invoices.filter((inv) => inv.status === InvoiceStatus.OVERDUE).length,
    };

    return {
      totalInvoices,
      totalAmount: Math.round(totalAmount * 100) / 100,
      totalPaid: Math.round(totalPaid * 100) / 100,
      totalUnpaid: Math.round(totalUnpaid * 100) / 100,
      statusCounts,
    };
  }
}

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../../../database/entities/invoice.entity';
import { PaymentGatewayService } from './payment-gateway.service';
import {
  InitiatePaymentDto,
  VerifyPaymentDto,
  PaymentGateway,
} from '../dto/payment.dto';

/**
 * Payment Settings Entity (pseudo - in real app, store in database)
 */
interface PaymentSettings {
  userId: string;
  gateway: PaymentGateway;
  apiKey: string;
  apiSecret?: string;
  webhookSecret?: string;
  clientId?: string;
  clientSecret?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class PaymentsService {
  private paymentSettings: Map<string, PaymentSettings> = new Map();

  constructor(
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    private paymentGatewayService: PaymentGatewayService,
  ) {}

  /**
   * Setup payment gateway for user (Bring Your Own License - BYOL)
   */
  async setupPaymentGateway(
    userId: string,
    gateway: PaymentGateway,
    apiKey: string,
    apiSecret?: string,
    webhookSecret?: string,
    clientId?: string,
    clientSecret?: string,
  ): Promise<any> {
    const settings: PaymentSettings = {
      userId,
      gateway,
      apiKey,
      apiSecret,
      webhookSecret,
      clientId,
      clientSecret,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // In production, save to database
    const key = `${userId}-${gateway}`;
    this.paymentSettings.set(key, settings);

    // Initialize gateway
    this.paymentGatewayService.initializeGateway(
      gateway,
      apiKey,
      apiSecret,
      clientId,
      clientSecret,
    );

    return {
      message: `Payment gateway ${gateway} configured successfully`,
      gateway,
      isActive: true,
    };
  }

  /**
   * Get user's payment gateway settings
   */
  async getPaymentGatewaySettings(userId: string, gateway: PaymentGateway): Promise<any> {
    const key = `${userId}-${gateway}`;
    const settings = this.paymentSettings.get(key);

    if (!settings) {
      throw new NotFoundException(`Payment gateway ${gateway} not configured for this user`);
    }

    return {
      gateway: settings.gateway,
      isActive: settings.isActive,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
      // Don't return actual keys for security
    };
  }

  /**
   * Get all configured gateways for user
   */
  async getUserConfiguredGateways(userId: string): Promise<any[]> {
    const userGateways: any[] = [];

    for (const [key, settings] of this.paymentSettings.entries()) {
      if (settings.userId === userId) {
        userGateways.push({
          gateway: settings.gateway,
          isActive: settings.isActive,
          createdAt: settings.createdAt,
        });
      }
    }

    return userGateways;
  }

  /**
   * Initiate payment for invoice
   */
  async initiatePayment(
    userId: string,
    invoiceId: string,
    gateway: PaymentGateway,
    initData: InitiatePaymentDto,
  ): Promise<any> {
    // Verify invoice exists and belongs to user
    const invoice = await this.invoicesRepository.findOne({
      where: { id: invoiceId, userId },
      relations: ['client'],
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Check if there's remaining amount to pay
    const remainingAmount = invoice.totalAmount - invoice.amountPaid;
    if (remainingAmount <= 0) {
      throw new BadRequestException('Invoice is already fully paid');
    }

    // Get user's gateway settings
    const key = `${userId}-${gateway}`;
    const settings = this.paymentSettings.get(key);

    if (!settings || !settings.isActive) {
      throw new BadRequestException(`Payment gateway ${gateway} is not configured`);
    }

    // Prepare payment data
    const paymentData: InitiatePaymentDto = {
      amount: initData.amount || remainingAmount,
      currency: invoice.currency,
      invoiceId: invoice.id,
      clientEmail: invoice.client.email || 'client@example.com',
      clientName: invoice.client.name,
      description: `Payment for invoice ${invoice.invoiceNumber}`,
      returnUrl: initData.returnUrl,
    };

    // Validate payment amount
    if (paymentData.amount <= 0 || paymentData.amount > remainingAmount) {
      throw new BadRequestException(
        `Payment amount must be between 0 and ${remainingAmount}`,
      );
    }

    // Initiate payment via gateway
    const paymentResponse = await this.paymentGatewayService.initiatePayment(
      gateway,
      paymentData,
    );

    return {
      invoiceId,
      gateway,
      amount: paymentData.amount,
      ...paymentResponse,
    };
  }

  /**
   * Verify payment status
   */
  async verifyPayment(
    userId: string,
    invoiceId: string,
    gateway: PaymentGateway,
    transactionId: string,
  ): Promise<any> {
    // Verify invoice exists
    const invoice = await this.invoicesRepository.findOne({
      where: { id: invoiceId, userId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Verify payment via gateway
    const paymentInfo = await this.paymentGatewayService.verifyPayment(
      gateway,
      transactionId,
    );

    return {
      invoiceId,
      transactionId,
      gateway,
      status: paymentInfo.status,
      message: paymentInfo.message,
    };
  }

  /**
   * Handle payment webhook (generic)
   */
  async handlePaymentWebhook(gateway: PaymentGateway, payload: any): Promise<any> {
    // Process webhook through gateway adapter
    const webhookResult = await this.paymentGatewayService.handleWebhook(gateway, payload);

    // In production:
    // 1. Verify webhook signature
    // 2. Extract transaction and invoice IDs
    // 3. Update invoice payment status
    // 4. Send confirmation email
    // 5. Log webhook event

    return {
      success: true,
      processed: true,
      gateway,
      message: 'Webhook processed successfully',
      ...webhookResult,
    };
  }

  /**
   * Get payment link for invoice (for sharing)
   */
  async getPaymentLink(
    userId: string,
    invoiceId: string,
    gateway: PaymentGateway,
  ): Promise<any> {
    const invoice = await this.invoicesRepository.findOne({
      where: { id: invoiceId, userId },
      relations: ['client'],
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const remainingAmount = invoice.totalAmount - invoice.amountPaid;

    return {
      invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      amount: remainingAmount,
      currency: invoice.currency,
      gateway,
      clientName: invoice.client.name,
      description: `Payment for invoice ${invoice.invoiceNumber}`,
      message: 'Use the initiatePayment endpoint to generate payment link',
    };
  }

  /**
   * Get payment history for invoice
   */
  async getInvoicePayments(userId: string, invoiceId: string): Promise<any[]> {
    const invoice = await this.invoicesRepository.findOne({
      where: { id: invoiceId, userId },
      relations: ['payments'],
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice.payments || [];
  }
}

import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InitiatePaymentDto, VerifyPaymentDto, PaymentGateway } from '../dto/payment.dto';

/**
 * Abstract Payment Gateway Interface
 */
abstract class PaymentGatewayAdapter {
  abstract initiatePayment(data: any): Promise<any>;
  abstract verifyPayment(transactionId: string): Promise<any>;
  abstract handleWebhook(payload: any): Promise<any>;
}

/**
 * Midtrans Payment Gateway
 */
class MidtransGateway extends PaymentGatewayAdapter {
  private serverKey: string;

  constructor(serverKey: string) {
    super();
    this.serverKey = serverKey;
  }

  async initiatePayment(data: InitiatePaymentDto): Promise<any> {
    // In production, call Midtrans API
    // For now, return mock response
    return {
      gateway: 'midtrans',
      transactionId: `MTR-${Date.now()}`,
      redirectUrl: 'https://app.sandbox.midtrans.com/snap/v2/' + Math.random().toString(36),
      status: 'pending',
      message: 'Payment initiated on Midtrans. In production, use actual API.',
    };
  }

  async verifyPayment(transactionId: string): Promise<any> {
    // In production, call Midtrans API to verify
    return {
      transactionId,
      status: 'settlement',
      amount: 0,
      message: 'Payment verified. Use actual Midtrans API in production.',
    };
  }

  async handleWebhook(payload: any): Promise<any> {
    // Verify webhook signature and process payment
    return {
      success: true,
      transactionId: payload.transaction_id,
      status: payload.transaction_status,
    };
  }
}

/**
 * Xendit Payment Gateway
 */
class XenditGateway extends PaymentGatewayAdapter {
  private apiKey: string;

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }

  async initiatePayment(data: InitiatePaymentDto): Promise<any> {
    // In production, call Xendit API
    return {
      gateway: 'xendit',
      invoiceId: `XENDIT-${Date.now()}`,
      invoiceUrl: 'https://checkout.xendit.co/invoice/' + Math.random().toString(36),
      status: 'pending',
      message: 'Payment initiated on Xendit. In production, use actual API.',
    };
  }

  async verifyPayment(invoiceId: string): Promise<any> {
    // In production, call Xendit API
    return {
      invoiceId,
      status: 'PAID',
      paidAmount: 0,
      message: 'Payment verified. Use actual Xendit API in production.',
    };
  }

  async handleWebhook(payload: any): Promise<any> {
    // Verify webhook signature and process payment
    return {
      success: true,
      invoiceId: payload.id,
      status: payload.status,
    };
  }
}

/**
 * Stripe Payment Gateway
 */
class StripeGateway extends PaymentGatewayAdapter {
  private secretKey: string;

  constructor(secretKey: string) {
    super();
    this.secretKey = secretKey;
  }

  async initiatePayment(data: InitiatePaymentDto): Promise<any> {
    // In production, call Stripe API
    return {
      gateway: 'stripe',
      sessionId: `cs_${Math.random().toString(36)}`,
      clientSecret: `pi_${Math.random().toString(36)}`,
      publishableKey: 'pk_test_...',
      message: 'Payment session created. Use actual Stripe API in production.',
    };
  }

  async verifyPayment(sessionId: string): Promise<any> {
    // In production, call Stripe API
    return {
      sessionId,
      paymentStatus: 'paid',
      amount: 0,
      message: 'Payment verified. Use actual Stripe API in production.',
    };
  }

  async handleWebhook(payload: any): Promise<any> {
    // Verify webhook signature and process payment
    return {
      success: true,
      eventId: payload.id,
      eventType: payload.type,
    };
  }
}

/**
 * PayPal Payment Gateway
 */
class PayPalGateway extends PaymentGatewayAdapter {
  private clientId: string;
  private clientSecret: string;

  constructor(clientId: string, clientSecret: string) {
    super();
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  async initiatePayment(data: InitiatePaymentDto): Promise<any> {
    // In production, call PayPal API
    return {
      gateway: 'paypal',
      orderId: `PP-${Date.now()}`,
      approvalUrl: 'https://www.paypal.com/checkoutnow?token=...',
      message: 'Payment order created. Use actual PayPal API in production.',
    };
  }

  async verifyPayment(orderId: string): Promise<any> {
    // In production, call PayPal API
    return {
      orderId,
      status: 'COMPLETED',
      amount: 0,
      message: 'Payment verified. Use actual PayPal API in production.',
    };
  }

  async handleWebhook(payload: any): Promise<any> {
    // Verify webhook signature and process payment
    return {
      success: true,
      orderId: payload.resource.id,
      eventType: payload.event_type,
    };
  }
}

/**
 * Payment Gateway Factory Service
 */
@Injectable()
export class PaymentGatewayService {
  private gateways: Map<string, PaymentGatewayAdapter> = new Map();

  constructor(private configService: ConfigService) {}

  /**
   * Initialize payment gateway with credentials
   */
  initializeGateway(
    gateway: PaymentGateway,
    apiKey: string,
    apiSecret?: string,
    clientId?: string,
    clientSecret?: string,
  ): void {
    let adapter: PaymentGatewayAdapter;

    switch (gateway) {
      case PaymentGateway.MIDTRANS:
        adapter = new MidtransGateway(apiKey);
        break;

      case PaymentGateway.XENDIT:
        adapter = new XenditGateway(apiKey);
        break;

      case PaymentGateway.STRIPE:
        adapter = new StripeGateway(apiKey);
        break;

      case PaymentGateway.PAYPAL:
        adapter = new PayPalGateway(clientId || '', clientSecret || '');
        break;

      default:
        throw new BadRequestException(`Unsupported payment gateway: ${gateway}`);
    }

    this.gateways.set(gateway, adapter);
  }

  /**
   * Get gateway adapter
   */
  getGateway(gateway: PaymentGateway): PaymentGatewayAdapter {
    const adapter = this.gateways.get(gateway);
    if (!adapter) {
      throw new BadRequestException(
        `Payment gateway ${gateway} is not configured. Please set up in settings first.`,
      );
    }
    return adapter;
  }

  /**
   * Initiate payment on specified gateway
   */
  async initiatePayment(
    gateway: PaymentGateway,
    paymentData: InitiatePaymentDto,
  ): Promise<any> {
    const adapter = this.getGateway(gateway);
    return adapter.initiatePayment(paymentData);
  }

  /**
   * Verify payment status
   */
  async verifyPayment(gateway: PaymentGateway, transactionId: string): Promise<any> {
    const adapter = this.getGateway(gateway);
    return adapter.verifyPayment(transactionId);
  }

  /**
   * Handle webhook from payment gateway
   */
  async handleWebhook(gateway: PaymentGateway, payload: any): Promise<any> {
    const adapter = this.getGateway(gateway);
    return adapter.handleWebhook(payload);
  }

  /**
   * Get all configured gateways
   */
  getConfiguredGateways(): string[] {
    return Array.from(this.gateways.keys());
  }

  /**
   * Check if gateway is configured
   */
  isGatewayConfigured(gateway: PaymentGateway): boolean {
    return this.gateways.has(gateway);
  }
}

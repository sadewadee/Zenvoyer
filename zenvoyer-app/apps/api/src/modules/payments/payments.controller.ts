import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentsService } from './services/payments.service';
import { RequireSubscription } from '../../common/decorators';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';
import {
  SetupPaymentGatewayDto,
  InitiatePaymentDto,
  PaymentGateway,
} from './dto/payment.dto';

@Controller('payments')
@UseGuards(AuthGuard('jwt'))
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  /**
   * Setup payment gateway (BYOL - Bring Your Own License)
   * Pro feature only
   */
  @Post('gateway/setup')
  @UseGuards(SubscriptionGuard)
  @RequireSubscription('pro')
  @HttpCode(200)
  async setupPaymentGateway(
    @Req() request: any,
    @Body() setupDto: SetupPaymentGatewayDto,
  ) {
    return this.paymentsService.setupPaymentGateway(
      request.user.id,
      setupDto.gateway,
      setupDto.apiKey,
      setupDto.apiSecret,
      setupDto.webhookSecret,
      setupDto.clientId,
      setupDto.clientSecret,
    );
  }

  /**
   * Get payment gateway settings for user
   */
  @Get('gateway/:gateway')
  async getPaymentGatewaySettings(
    @Req() request: any,
    @Param('gateway') gateway: string,
  ) {
    return this.paymentsService.getPaymentGatewaySettings(
      request.user.id,
      gateway as PaymentGateway,
    );
  }

  /**
   * Get all configured gateways for user
   */
  @Get('gateway/list')
  async getConfiguredGateways(@Req() request: any) {
    return this.paymentsService.getUserConfiguredGateways(request.user.id);
  }

  /**
   * Initiate payment for invoice
   */
  @Post('initiate')
  @HttpCode(200)
  async initiatePayment(
    @Req() request: any,
    @Body('invoiceId') invoiceId: string,
    @Body('gateway') gateway: PaymentGateway,
    @Body('paymentData') paymentData: InitiatePaymentDto,
  ) {
    return this.paymentsService.initiatePayment(
      request.user.id,
      invoiceId,
      gateway,
      paymentData,
    );
  }

  /**
   * Verify payment status
   */
  @Post('verify')
  @HttpCode(200)
  async verifyPayment(
    @Req() request: any,
    @Body('invoiceId') invoiceId: string,
    @Body('gateway') gateway: PaymentGateway,
    @Body('transactionId') transactionId: string,
  ) {
    return this.paymentsService.verifyPayment(
      request.user.id,
      invoiceId,
      gateway,
      transactionId,
    );
  }

  /**
   * Get payment link for invoice
   */
  @Get('link/:invoiceId/:gateway')
  async getPaymentLink(
    @Req() request: any,
    @Param('invoiceId') invoiceId: string,
    @Param('gateway') gateway: PaymentGateway,
  ) {
    return this.paymentsService.getPaymentLink(request.user.id, invoiceId, gateway);
  }

  /**
   * Get payment history for invoice
   */
  @Get('history/:invoiceId')
  async getInvoicePayments(
    @Req() request: any,
    @Param('invoiceId') invoiceId: string,
  ) {
    return this.paymentsService.getInvoicePayments(request.user.id, invoiceId);
  }

  /**
   * Handle Midtrans webhook
   */
  @Post('webhook/midtrans')
  @HttpCode(200)
  async handleMidtransWebhook(@Body() payload: any) {
    return this.paymentsService.handlePaymentWebhook(PaymentGateway.MIDTRANS, payload);
  }

  /**
   * Handle Xendit webhook
   */
  @Post('webhook/xendit')
  @HttpCode(200)
  async handleXenditWebhook(@Body() payload: any) {
    return this.paymentsService.handlePaymentWebhook(PaymentGateway.XENDIT, payload);
  }

  /**
   * Handle Stripe webhook
   */
  @Post('webhook/stripe')
  @HttpCode(200)
  async handleStripeWebhook(@Body() payload: any) {
    return this.paymentsService.handlePaymentWebhook(PaymentGateway.STRIPE, payload);
  }

  /**
   * Handle PayPal webhook
   */
  @Post('webhook/paypal')
  @HttpCode(200)
  async handlePayPalWebhook(@Body() payload: any) {
    return this.paymentsService.handlePaymentWebhook(PaymentGateway.PAYPAL, payload);
  }
}

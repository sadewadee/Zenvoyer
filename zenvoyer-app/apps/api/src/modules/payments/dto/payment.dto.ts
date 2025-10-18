import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export enum PaymentGateway {
  MIDTRANS = 'midtrans',
  XENDIT = 'xendit',
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
}

export class SetupPaymentGatewayDto {
  @IsEnum(PaymentGateway)
  gateway: PaymentGateway;

  @IsString()
  apiKey: string;

  @IsOptional()
  @IsString()
  apiSecret?: string;

  @IsOptional()
  @IsString()
  webhookSecret?: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  clientSecret?: string;
}

export class InitiatePaymentDto {
  @IsNumber()
  amount: number;

  @IsString()
  currency: string;

  @IsString()
  invoiceId: string;

  @IsString()
  clientEmail: string;

  @IsString()
  clientName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  returnUrl?: string;
}

export class VerifyPaymentDto {
  @IsString()
  transactionId: string;

  @IsString()
  gateway: string;
}

export class PaymentWebhookDto {
  @IsString()
  transactionId: string;

  @IsString()
  status: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

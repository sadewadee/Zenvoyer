import { IsEmail, IsString, IsOptional, IsArray } from 'class-validator';

export class SendInvoiceEmailDto {
  @IsEmail()
  recipientEmail: string;

  @IsOptional()
  @IsString()
  recipientName?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsArray()
  ccEmails?: string[];

  @IsOptional()
  @IsArray()
  bccEmails?: string[];
}

export class SendPaymentConfirmationDto {
  @IsEmail()
  recipientEmail: string;

  @IsString()
  invoiceNumber: string;

  @IsString()
  amount: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  transactionId?: string;
}

export class SendWelcomeEmailDto {
  @IsEmail()
  recipientEmail: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  businessName?: string;
}

export class SendSubscriptionUpgradeDto {
  @IsEmail()
  recipientEmail: string;

  @IsString()
  firstName: string;

  @IsString()
  subscriptionPlan: string;

  @IsOptional()
  @IsString()
  billingPeriod?: string;

  @IsOptional()
  @IsString()
  amount?: string;
}

export class GeneratePdfDto {
  @IsString()
  invoiceId: string;

  @IsOptional()
  @IsString()
  format?: 'a4' | 'letter';

  @IsOptional()
  @IsString()
  filename?: string;
}

export class EmailResponseDto {
  success: boolean;
  message: string;
  messageId?: string;
  timestamp: Date;
}

export class PdfResponseDto {
  success: boolean;
  filename: string;
  size: number;
  mimeType: string;
  timestamp: Date;
}

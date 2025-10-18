import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import {
  PdfGenerationService,
  EmailService,
  EmailTemplatesService,
} from './services';
import { RequirePermissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import {
  SendInvoiceEmailDto,
  SendPaymentConfirmationDto,
  SendWelcomeEmailDto,
  SendSubscriptionUpgradeDto,
  GeneratePdfDto,
  EmailResponseDto,
  PdfResponseDto,
} from './dto/notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private pdfService: PdfGenerationService,
    private emailService: EmailService,
    private emailTemplatesService: EmailTemplatesService,
  ) {}

  /**
   * Generate invoice PDF
   */
  @Post('pdf/invoice/:invoiceId')
  @UseGuards(AuthGuard('jwt'))
  @UseGuards(PermissionsGuard)
  @RequirePermissions('canViewInvoices')
  async generateInvoicePdf(
    @Req() request: any,
    @Param('invoiceId') invoiceId: string,
    @Body() generatePdfDto: GeneratePdfDto,
  ): Promise<PdfResponseDto> {
    const pdfBuffer = await this.pdfService.generateInvoicePdf(
      invoiceId,
      request.user.id,
      {
        format: generatePdfDto.format,
      },
    );

    const filename =
      generatePdfDto.filename || `invoice-${invoiceId}-${Date.now()}.pdf`;

    return {
      success: true,
      filename,
      size: pdfBuffer.length,
      mimeType: 'application/pdf',
      timestamp: new Date(),
    };
  }

  /**
   * Download invoice PDF
   */
  @Get('pdf/invoice/:invoiceId/download')
  @UseGuards(AuthGuard('jwt'))
  @UseGuards(PermissionsGuard)
  @RequirePermissions('canViewInvoices')
  async downloadInvoicePdf(
    @Req() request: any,
    @Param('invoiceId') invoiceId: string,
    @Res() response: Response,
  ) {
    const pdfBuffer = await this.pdfService.generateInvoicePdf(
      invoiceId,
      request.user.id,
    );

    response.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${invoiceId}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    response.send(pdfBuffer);
  }

  /**
   * Get public invoice PDF (no auth required)
   */
  @Get('pdf/public/:token/download')
  async downloadPublicInvoicePdf(
    @Param('token') shareToken: string,
    @Res() response: Response,
  ) {
    const pdfBuffer = await this.pdfService.generatePublicInvoicePdf(shareToken);

    response.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${shareToken}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    response.send(pdfBuffer);
  }

  /**
   * Send invoice email
   */
  @Post('email/invoice/send')
  @UseGuards(AuthGuard('jwt'))
  @UseGuards(PermissionsGuard)
  @RequirePermissions('canViewInvoices')
  @HttpCode(200)
  async sendInvoiceEmail(
    @Req() request: any,
    @Body('invoiceId') invoiceId: string,
    @Body() sendInvoiceEmailDto: SendInvoiceEmailDto,
  ): Promise<EmailResponseDto> {
    // Generate PDF
    const pdfBuffer = await this.pdfService.generateInvoicePdf(
      invoiceId,
      request.user.id,
    );

    // Get email template
    const template = this.emailTemplatesService.getInvoiceSentEmailTemplate(
      sendInvoiceEmailDto.recipientName || 'Client',
      'INV-001', // Get actual invoice number
      '$5,000.00', // Get actual amount
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      `${process.env.APP_URL || 'https://app.zenvoyer.com'}/invoices/${invoiceId}`,
      request.user.firstName,
    );

    // Send email
    const result = await this.emailService.sendEmailWithAttachment(
      {
        to: sendInvoiceEmailDto.recipientEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
        cc: sendInvoiceEmailDto.ccEmails,
        bcc: sendInvoiceEmailDto.bccEmails,
      },
      pdfBuffer,
      `invoice-${invoiceId}.pdf`,
    );

    return {
      success: result.status === 'sent',
      message: `Invoice email sent successfully to ${sendInvoiceEmailDto.recipientEmail}`,
      messageId: result.messageId,
      timestamp: new Date(),
    };
  }

  /**
   * Send welcome email
   */
  @Post('email/welcome')
  @HttpCode(200)
  async sendWelcomeEmail(
    @Body() sendWelcomeEmailDto: SendWelcomeEmailDto,
  ): Promise<EmailResponseDto> {
    const template = this.emailTemplatesService.getWelcomeEmailTemplate(
      sendWelcomeEmailDto.firstName,
      sendWelcomeEmailDto.lastName,
      sendWelcomeEmailDto.businessName,
    );

    const result = await this.emailService.sendEmail({
      to: sendWelcomeEmailDto.recipientEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    return {
      success: result.status === 'sent',
      message: `Welcome email sent to ${sendWelcomeEmailDto.recipientEmail}`,
      messageId: result.messageId,
      timestamp: new Date(),
    };
  }

  /**
   * Send payment confirmation email
   */
  @Post('email/payment-confirmation')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(200)
  async sendPaymentConfirmation(
    @Req() request: any,
    @Body() sendPaymentConfirmationDto: SendPaymentConfirmationDto,
  ): Promise<EmailResponseDto> {
    const template = this.emailTemplatesService.getPaymentReceivedEmailTemplate(
      'Client',
      sendPaymentConfirmationDto.invoiceNumber,
      sendPaymentConfirmationDto.amount,
      sendPaymentConfirmationDto.paymentMethod,
      sendPaymentConfirmationDto.transactionId,
      request.user.firstName,
    );

    const result = await this.emailService.sendEmail({
      to: sendPaymentConfirmationDto.recipientEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    return {
      success: result.status === 'sent',
      message: `Payment confirmation email sent to ${sendPaymentConfirmationDto.recipientEmail}`,
      messageId: result.messageId,
      timestamp: new Date(),
    };
  }

  /**
   * Send subscription upgrade email
   */
  @Post('email/subscription-upgrade')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(200)
  async sendSubscriptionUpgradeEmail(
    @Req() request: any,
    @Body() sendSubscriptionUpgradeDto: SendSubscriptionUpgradeDto,
  ): Promise<EmailResponseDto> {
    const template = this.emailTemplatesService.getSubscriptionUpgradeEmailTemplate(
      sendSubscriptionUpgradeDto.firstName,
      sendSubscriptionUpgradeDto.subscriptionPlan,
      sendSubscriptionUpgradeDto.billingPeriod,
      sendSubscriptionUpgradeDto.amount,
    );

    const result = await this.emailService.sendEmail({
      to: sendSubscriptionUpgradeDto.recipientEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    return {
      success: result.status === 'sent',
      message: `Subscription upgrade email sent to ${sendSubscriptionUpgradeDto.recipientEmail}`,
      messageId: result.messageId,
      timestamp: new Date(),
    };
  }

  /**
   * Get email provider status
   */
  @Get('email/status')
  getEmailStatus() {
    return this.emailService.getProviderStatus();
  }

  /**
   * Health check
   */
  @Get('health')
  getHealth() {
    return {
      status: 'healthy',
      timestamp: new Date(),
      services: {
        pdf: 'ready',
        email: this.emailService.getProviderStatus(),
      },
    };
  }
}

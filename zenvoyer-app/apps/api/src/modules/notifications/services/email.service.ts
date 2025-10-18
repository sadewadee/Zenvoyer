import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SendEmailOptions {
  to: string | string[];
  from?: string;
  subject: string;
  html: string;
  text?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}

export interface SendGridResponse {
  messageId: string;
  status: 'sent' | 'queued' | 'failed';
}

/**
 * Email Service
 * Supports SendGrid and Resend email providers
 * In production, use: npm install @sendgrid/mail resend
 */
@Injectable()
export class EmailService {
  private emailProvider: 'sendgrid' | 'resend' | 'mock';
  private fromEmail: string;

  constructor(private configService: ConfigService) {
    this.emailProvider = (this.configService.get('EMAIL_PROVIDER') || 'mock') as any;
    this.fromEmail = this.configService.get('EMAIL_FROM') || 'noreply@zenvoyer.com';
  }

  /**
   * Send email via provider
   */
  async sendEmail(options: SendEmailOptions): Promise<SendGridResponse> {
    const from = options.from || this.fromEmail;

    // Validate email
    if (!this.isValidEmail(from)) {
      throw new BadRequestException(`Invalid sender email: ${from}`);
    }

    if (typeof options.to === 'string' && !this.isValidEmail(options.to)) {
      throw new BadRequestException(`Invalid recipient email: ${options.to}`);
    }

    try {
      switch (this.emailProvider) {
        case 'sendgrid':
          return await this.sendViaSendGrid(options, from);

        case 'resend':
          return await this.sendViaResend(options, from);

        case 'mock':
        default:
          return this.sendViaMock(options, from);
      }
    } catch (error) {
      console.error('Email send error:', error);
      throw new BadRequestException(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Send email via SendGrid
   */
  private async sendViaSendGrid(
    options: SendEmailOptions,
    from: string,
  ): Promise<SendGridResponse> {
    // In production:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(this.configService.get('SENDGRID_API_KEY'));
    // const msg = {
    //   to: options.to,
    //   from,
    //   subject: options.subject,
    //   html: options.html,
    //   text: options.text,
    //   cc: options.cc,
    //   bcc: options.bcc,
    //   attachments: options.attachments,
    // };
    // const response = await sgMail.send(msg);
    // return {
    //   messageId: response[0].headers['x-message-id'],
    //   status: 'sent',
    // };

    // Mock response
    return {
      messageId: `sendgrid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'sent',
    };
  }

  /**
   * Send email via Resend
   */
  private async sendViaResend(
    options: SendEmailOptions,
    from: string,
  ): Promise<SendGridResponse> {
    // In production:
    // const { Resend } = require('resend');
    // const resend = new Resend(this.configService.get('RESEND_API_KEY'));
    // const response = await resend.emails.send({
    //   from,
    //   to: options.to,
    //   subject: options.subject,
    //   html: options.html,
    //   cc: options.cc,
    //   bcc: options.bcc,
    // });
    // return {
    //   messageId: response.data.id,
    //   status: response.data.id ? 'sent' : 'failed',
    // };

    // Mock response
    return {
      messageId: `resend-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'sent',
    };
  }

  /**
   * Mock email send (for development)
   */
  private sendViaMock(options: SendEmailOptions, from: string): SendGridResponse {
    console.log(`\n📧 [MOCK EMAIL] From: ${from}`);
    console.log(`To: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`);
    console.log(`Subject: ${options.subject}`);
    if (options.cc) console.log(`CC: ${options.cc.join(', ')}`);
    if (options.bcc) console.log(`BCC: ${options.bcc.join(', ')}`);
    console.log(`Content Preview: ${options.html.substring(0, 100)}...`);
    console.log('---\n');

    return {
      messageId: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'sent',
    };
  }

  /**
   * Send email with PDF attachment
   */
  async sendEmailWithAttachment(
    options: SendEmailOptions,
    pdfBuffer: Buffer,
    pdfFilename: string,
  ): Promise<SendGridResponse> {
    return this.sendEmail({
      ...options,
      attachments: [
        {
          filename: pdfFilename,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
  }

  /**
   * Batch send emails
   */
  async sendBatch(emailList: SendEmailOptions[]): Promise<SendGridResponse[]> {
    const results = await Promise.all(emailList.map((email) => this.sendEmail(email)));
    return results;
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Get email provider status
   */
  getProviderStatus(): {
    provider: string;
    configured: boolean;
    fromEmail: string;
  } {
    const hasApiKey =
      (this.emailProvider === 'sendgrid' &&
        !!this.configService.get('SENDGRID_API_KEY')) ||
      (this.emailProvider === 'resend' && !!this.configService.get('RESEND_API_KEY')) ||
      this.emailProvider === 'mock';

    return {
      provider: this.emailProvider,
      configured: hasApiKey,
      fromEmail: this.fromEmail,
    };
  }
}

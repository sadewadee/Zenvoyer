import { Injectable } from '@nestjs/common';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Email Templates Service
 * Pre-built professional email templates
 */
@Injectable()
export class EmailTemplatesService {
  /**
   * Welcome email template
   */
  getWelcomeEmailTemplate(
    firstName: string,
    lastName: string,
    businessName?: string,
    loginUrl: string = 'https://app.zenvoyer.com/login',
  ): EmailTemplate {
    const fullName = `${firstName} ${lastName}`;

    return {
      subject: `Welcome to Zenvoyer, ${firstName}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; }
            .email-content { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .header { border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; margin: 20px 0; }
            .features { margin: 30px 0; }
            .feature { margin: 15px 0; padding-left: 20px; border-left: 3px solid #2563eb; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6B7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="email-content">
              <div class="header">
                <div class="logo">Zenvoyer</div>
                <p style="margin: 10px 0 0 0; color: #6B7280;">Professional Invoice Management</p>
              </div>

              <h2>Welcome, ${fullName}!</h2>
              <p>We're excited to have you join Zenvoyer. Your account has been successfully created!</p>

              ${
                businessName
                  ? `<p>Business: <strong>${businessName}</strong></p>`
                  : ''
              }

              <a href="${loginUrl}" class="button">Login to Your Account</a>

              <div class="features">
                <h3>What You Can Do Now:</h3>
                <div class="feature">
                  <strong>📄 Create Invoices</strong> - Professional invoices in seconds
                </div>
                <div class="feature">
                  <strong>👥 Manage Clients</strong> - Keep all client information organized
                </div>
                <div class="feature">
                  <strong>💰 Track Payments</strong> - Never miss a payment
                </div>
                <div class="feature">
                  <strong>📊 View Analytics</strong> - See your business metrics at a glance
                </div>
              </div>

              <p>If you have any questions, feel free to reach out to our support team.</p>

              <div class="footer">
                <p>© 2024 Zenvoyer. All rights reserved.</p>
                <p>You're receiving this email because you signed up for a Zenvoyer account.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Welcome to Zenvoyer, ${fullName}!\n\nYour account has been successfully created. Login here: ${loginUrl}\n\nYou can now create invoices, manage clients, track payments, and view analytics.\n\nBest regards,\nThe Zenvoyer Team`,
    };
  }

  /**
   * Invoice sent email template
   */
  getInvoiceSentEmailTemplate(
    clientName: string,
    invoiceNumber: string,
    amount: string,
    dueDate: string,
    viewUrl: string,
    senderName?: string,
  ): EmailTemplate {
    return {
      subject: `Invoice ${invoiceNumber} from ${senderName || 'Zenvoyer'}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; }
            .email-content { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .invoice-box { background: #f3f4f6; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #2563eb; }
            .invoice-row { display: flex; justify-content: space-between; margin: 10px 0; }
            .invoice-label { font-weight: 600; color: #6B7280; }
            .invoice-value { font-weight: bold; color: #333; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; margin: 20px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6B7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="email-content">
              <h2>Hello ${clientName},</h2>
              <p>An invoice has been sent to you. Please see the details below:</p>

              <div class="invoice-box">
                <div class="invoice-row">
                  <span class="invoice-label">Invoice Number:</span>
                  <span class="invoice-value">${invoiceNumber}</span>
                </div>
                <div class="invoice-row">
                  <span class="invoice-label">Amount Due:</span>
                  <span class="invoice-value">${amount}</span>
                </div>
                <div class="invoice-row">
                  <span class="invoice-label">Due Date:</span>
                  <span class="invoice-value">${dueDate}</span>
                </div>
              </div>

              <a href="${viewUrl}" class="button">View Invoice</a>

              <p>If you have any questions about this invoice, please don't hesitate to contact us.</p>

              <div class="footer">
                <p>© 2024 Zenvoyer. All rights reserved.</p>
                <p>This is an automated message. Please do not reply to this email.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hello ${clientName},\n\nInvoice: ${invoiceNumber}\nAmount Due: ${amount}\nDue Date: ${dueDate}\n\nView Invoice: ${viewUrl}\n\nBest regards,\nZenvoyer`,
    };
  }

  /**
   * Payment received email template
   */
  getPaymentReceivedEmailTemplate(
    clientName: string,
    invoiceNumber: string,
    amount: string,
    paymentMethod?: string,
    transactionId?: string,
    senderName?: string,
  ): EmailTemplate {
    return {
      subject: `Payment Received for Invoice ${invoiceNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; }
            .email-content { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .success-box { background: #ecfdf5; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #10B981; }
            .success-box h3 { color: #10B981; margin: 0 0 10px 0; }
            .payment-details { background: #f3f4f6; padding: 20px; border-radius: 4px; margin: 20px 0; }
            .payment-row { display: flex; justify-content: space-between; margin: 10px 0; }
            .payment-label { font-weight: 600; color: #6B7280; }
            .payment-value { font-weight: bold; color: #333; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6B7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="email-content">
              <h2>Payment Received!</h2>

              <div class="success-box">
                <h3>✓ Thank you for your payment</h3>
                <p>Your payment has been successfully received and processed.</p>
              </div>

              <div class="payment-details">
                <div class="payment-row">
                  <span class="payment-label">Invoice Number:</span>
                  <span class="payment-value">${invoiceNumber}</span>
                </div>
                <div class="payment-row">
                  <span class="payment-label">Amount Paid:</span>
                  <span class="payment-value">${amount}</span>
                </div>
                ${
                  paymentMethod
                    ? `
                <div class="payment-row">
                  <span class="payment-label">Payment Method:</span>
                  <span class="payment-value">${paymentMethod}</span>
                </div>
                `
                    : ''
                }
                ${
                  transactionId
                    ? `
                <div class="payment-row">
                  <span class="payment-label">Transaction ID:</span>
                  <span class="payment-value">${transactionId}</span>
                </div>
                `
                    : ''
                }
              </div>

              <p>If you have any questions or need an updated invoice, please let us know.</p>

              <div class="footer">
                <p>© 2024 Zenvoyer. All rights reserved.</p>
                <p>This is an automated message. Please do not reply to this email.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Payment Received!\n\nThank you for your payment.\n\nInvoice: ${invoiceNumber}\nAmount Paid: ${amount}\n${paymentMethod ? `Payment Method: ${paymentMethod}\n` : ''}${transactionId ? `Transaction ID: ${transactionId}\n` : ''}\n\nBest regards,\n${senderName || 'Zenvoyer'}`,
    };
  }

  /**
   * Subscription upgrade email template
   */
  getSubscriptionUpgradeEmailTemplate(
    firstName: string,
    subscriptionPlan: string,
    billingPeriod?: string,
    amount?: string,
    dashboardUrl: string = 'https://app.zenvoyer.com/dashboard',
  ): EmailTemplate {
    const planFeatures = {
      pro: [
        'Unlimited invoices',
        'Unlimited clients & products',
        'Payment gateway setup',
        'Team members',
        'Advanced analytics',
        'Priority support',
      ],
    };

    const features = planFeatures[subscriptionPlan.toLowerCase()] || [];

    return {
      subject: `Welcome to Zenvoyer ${subscriptionPlan}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; }
            .email-content { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .upgrade-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; margin: 20px 0; text-align: center; }
            .plan-name { font-size: 32px; font-weight: bold; margin: 10px 0; }
            .features { margin: 30px 0; }
            .feature { margin: 12px 0; padding-left: 20px; border-left: 3px solid #2563eb; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; margin: 20px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6B7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="email-content">
              <h2>Congratulations, ${firstName}!</h2>
              <p>Your subscription has been successfully upgraded!</p>

              <div class="upgrade-box">
                <p style="margin: 0;">You are now on</p>
                <div class="plan-name">${subscriptionPlan}</div>
                ${
                  billingPeriod && amount
                    ? `<p style="margin: 10px 0 0 0;">${amount} / ${billingPeriod}</p>`
                    : ''
                }
              </div>

              <div class="features">
                <h3>Your New Features:</h3>
                ${features.map((feature) => `<div class="feature">✓ ${feature}</div>`).join('')}
              </div>

              <a href="${dashboardUrl}" class="button">Go to Dashboard</a>

              <p>Thank you for your business! If you have any questions, please don't hesitate to reach out.</p>

              <div class="footer">
                <p>© 2024 Zenvoyer. All rights reserved.</p>
                <p>You're receiving this email because your subscription was upgraded.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Congratulations!\n\nYour subscription has been upgraded to ${subscriptionPlan}!\n\n${billingPeriod && amount ? `Billing: ${amount} / ${billingPeriod}\n\n` : ''}Go to Dashboard: ${dashboardUrl}\n\nBest regards,\nThe Zenvoyer Team`,
    };
  }

  /**
   * Payment reminder email template
   */
  getPaymentReminderEmailTemplate(
    clientName: string,
    invoiceNumber: string,
    amount: string,
    daysOverdue: number,
    viewUrl: string,
  ): EmailTemplate {
    return {
      subject: `Payment Reminder: Invoice ${invoiceNumber} is ${daysOverdue} days overdue`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; }
            .email-content { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .alert-box { background: #fef3c7; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #f59e0b; }
            .alert-box h3 { color: #d97706; margin: 0 0 10px 0; }
            .invoice-details { background: #f3f4f6; padding: 20px; border-radius: 4px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
            .detail-label { font-weight: 600; color: #6B7280; }
            .detail-value { font-weight: bold; color: #333; }
            .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; margin: 20px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6B7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="email-content">
              <h2>Payment Reminder</h2>

              <div class="alert-box">
                <h3>⚠ Invoice is ${daysOverdue} days overdue</h3>
                <p>We have not yet received payment for the invoice below. Please review and process payment at your earliest convenience.</p>
              </div>

              <div class="invoice-details">
                <div class="detail-row">
                  <span class="detail-label">Invoice Number:</span>
                  <span class="detail-value">${invoiceNumber}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Amount Due:</span>
                  <span class="detail-value">${amount}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Days Overdue:</span>
                  <span class="detail-value">${daysOverdue}</span>
                </div>
              </div>

              <a href="${viewUrl}" class="button">View & Pay Invoice</a>

              <p>If you have already processed this payment, please disregard this reminder. If you have any questions, please contact us immediately.</p>

              <div class="footer">
                <p>© 2024 Zenvoyer. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Payment Reminder\n\nInvoice ${invoiceNumber} is ${daysOverdue} days overdue.\n\nAmount Due: ${amount}\n\nView Invoice: ${viewUrl}\n\nPlease process payment as soon as possible.\n\nBest regards,\nZenvoyer`,
    };
  }
}

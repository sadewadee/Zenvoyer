import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Invoice } from '../../../database/entities/invoice.entity';
import { Client } from '../../../database/entities/client.entity';
import { User } from '../../../database/entities/user.entity';

/**
 * PDF Generation Service
 * In production, use: npm install puppeteer
 * For now, this is a mock implementation
 */
@Injectable()
export class PdfGenerationService {
  constructor(
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Generate PDF from HTML using Puppeteer
   * In production, use actual Puppeteer library
   */
  async generatePdf(
    html: string,
    options?: {
      format?: 'a4' | 'letter';
      margin?: {
        top?: string;
        right?: string;
        bottom?: string;
        left?: string;
      };
      landscape?: boolean;
    },
  ): Promise<Buffer> {
    // In production:
    // const browser = await puppeteer.launch();
    // const page = await browser.newPage();
    // await page.setContent(html);
    // const pdf = await page.pdf({
    //   format: options?.format || 'A4',
    //   margin: options?.margin,
    //   landscape: options?.landscape,
    // });
    // await browser.close();
    // return pdf;

    // Mock implementation
    const mockPdf = Buffer.from(
      `%PDF-1.4\n%mock-pdf-data\n${html.substring(0, 100)}\n`,
      'utf-8',
    );
    return mockPdf;
  }

  /**
   * Generate invoice PDF
   */
  async generateInvoicePdf(
    invoiceId: string,
    userId: string,
    options?: {
      format?: 'a4' | 'letter';
    },
  ): Promise<Buffer> {
    // Fetch invoice with relations
    const invoice = await this.invoicesRepository.findOne({
      where: { id: invoiceId, userId },
      relations: ['client', 'user', 'items', 'payments'],
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Generate HTML content
    const html = this.generateInvoiceHtml(invoice);

    // Generate PDF
    const pdfBuffer = await this.generatePdf(html, {
      format: options?.format || 'a4',
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm',
      },
    });

    return pdfBuffer;
  }

  /**
   * Generate public invoice PDF (from share token)
   */
  async generatePublicInvoicePdf(
    shareToken: string,
    options?: {
      format?: 'a4' | 'letter';
    },
  ): Promise<Buffer> {
    // Fetch invoice with share token
    const invoice = await this.invoicesRepository.findOne({
      where: { publicShareToken: shareToken, isPubliclyShared: true },
      relations: ['client', 'user', 'items', 'payments'],
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Check if link has expired
    if (invoice.publicShareExpiresAt && invoice.publicShareExpiresAt < new Date()) {
      throw new BadRequestException('This share link has expired');
    }

    // Generate HTML content
    const html = this.generateInvoiceHtml(invoice);

    // Generate PDF
    const pdfBuffer = await this.generatePdf(html, {
      format: options?.format || 'a4',
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm',
      },
    });

    return pdfBuffer;
  }

  /**
   * Generate HTML for invoice PDF
   * Professional invoice template
   */
  private generateInvoiceHtml(invoice: Invoice): string {
    const logoUrl = 'https://via.placeholder.com/150x50?text=Zenvoyer';
    const user = invoice.user as any;
    const client = invoice.client as any;

    const itemsHtml = invoice.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 8px; text-align: left;">${item.description}</td>
        <td style="padding: 8px; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; text-align: right;">$${item.unitPrice.toFixed(2)}</td>
        <td style="padding: 8px; text-align: right;">$${item.total.toFixed(2)}</td>
      </tr>
    `,
      )
      .join('');

    const statusColorMap = {
      draft: '#6B7280',
      sent: '#3B82F6',
      viewed: '#8B5CF6',
      paid: '#10B981',
      partial: '#F59E0B',
      overdue: '#EF4444',
    };

    const statusColor = statusColorMap[invoice.status] || '#6B7280';

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; }
          .container { max-width: 900px; margin: 0 auto; padding: 20px; }
          .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; }
          .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
          .status-badge { display: inline-block; background: ${statusColor}; color: white; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
          .invoice-details { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px; }
          .detail-section h3 { font-size: 12px; font-weight: 600; text-transform: uppercase; color: #6B7280; margin-bottom: 8px; }
          .detail-section p { margin: 4px 0; font-size: 14px; }
          .items-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
          .items-table th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: 600; font-size: 13px; text-transform: uppercase; border: 1px solid #e5e7eb; }
          .items-table td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
          .items-table tbody tr:last-child td { border-bottom: 2px solid #e5e7eb; }
          .summary { display: flex; justify-content: flex-end; margin: 30px 0; }
          .summary-table { width: 300px; }
          .summary-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
          .summary-row.total { border-bottom: 2px solid #e5e7eb; font-weight: 600; font-size: 16px; color: #2563eb; margin-top: 10px; }
          .summary-label { font-weight: 500; }
          .summary-value { text-align: right; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6B7280; }
          .terms { margin-top: 20px; padding: 15px; background: #f9fafb; border-left: 3px solid #2563eb; font-size: 13px; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Zenvoyer</div>
            <div style="text-align: right;">
              <div class="status-badge">${invoice.status}</div>
            </div>
          </div>

          <div class="invoice-details">
            <div>
              <div class="detail-section">
                <h3>Invoice To</h3>
                <p><strong>${client?.name || 'Client'}</strong></p>
                <p>${client?.email || ''}</p>
                <p>${client?.phoneNumber || ''}</p>
                <p>${client?.address || ''}</p>
              </div>
            </div>
            <div>
              <div class="detail-section">
                <h3>Invoice Details</h3>
                <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
                <p><strong>Invoice Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
                <p><strong>Currency:</strong> ${invoice.currency}</p>
              </div>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: center;">Quantity</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="summary">
            <div class="summary-table">
              <div class="summary-row">
                <span class="summary-label">Subtotal</span>
                <span class="summary-value">$${invoice.subtotal.toFixed(2)}</span>
              </div>
              ${
                invoice.discountAmount > 0
                  ? `
              <div class="summary-row">
                <span class="summary-label">Discount (${invoice.discountRate}%)</span>
                <span class="summary-value">-$${invoice.discountAmount.toFixed(2)}</span>
              </div>
              `
                  : ''
              }
              ${
                invoice.taxAmount > 0
                  ? `
              <div class="summary-row">
                <span class="summary-label">Tax (${invoice.taxRate}%)</span>
                <span class="summary-value">$${invoice.taxAmount.toFixed(2)}</span>
              </div>
              `
                  : ''
              }
              <div class="summary-row total">
                <span class="summary-label">Total Due</span>
                <span class="summary-value">$${invoice.totalAmount.toFixed(2)}</span>
              </div>
              ${
                invoice.amountPaid > 0
                  ? `
              <div class="summary-row">
                <span class="summary-label">Amount Paid</span>
                <span class="summary-value">$${invoice.amountPaid.toFixed(2)}</span>
              </div>
              <div class="summary-row total" style="color: #ef4444;">
                <span class="summary-label">Balance Due</span>
                <span class="summary-value">$${(invoice.totalAmount - invoice.amountPaid).toFixed(2)}</span>
              </div>
              `
                  : ''
              }
            </div>
          </div>

          ${
            invoice.notes
              ? `
          <div class="detail-section">
            <h3>Notes</h3>
            <p>${invoice.notes}</p>
          </div>
          `
              : ''
          }

          ${
            invoice.termsAndConditions
              ? `
          <div class="terms">
            <strong>Terms & Conditions:</strong><br>
            ${invoice.termsAndConditions}
          </div>
          `
              : ''
          }

          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Generated on ${new Date().toLocaleDateString()} | Zenvoyer Invoice Management</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Save PDF to file (optional)
   */
  async savePdfToFile(pdfBuffer: Buffer, filename: string): Promise<string> {
    const uploadsDir = path.join(process.cwd(), 'uploads', 'pdfs');

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, pdfBuffer);

    return filepath;
  }

  /**
   * Get PDF download path
   */
  getPdfDownloadPath(filename: string): string {
    return `/api/exports/pdf/${filename}`;
  }
}

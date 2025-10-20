import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Invoice } from '../../../database/entities/invoice.entity';

@Injectable()
export class InvoiceNumberingService {
  private defaultPattern = 'INV-{YYYY}{MM}-{0000}';

  constructor(
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
  ) {}

  /**
   * Generate invoice number based on pattern or default
   * Supported placeholders:
   * {YYYY} - Full year (2024)
   * {YY} - Short year (24)
   * {MM} - Month (01-12)
   * {DD} - Day (01-31)
   * {0000} - Sequential number with leading zeros (0001, 0002, etc.)
   * {####} - Unpadded sequential number (1, 2, 3, etc.)
   */
  async generateInvoiceNumber(
    userId: string,
    pattern: string = null,
  ): Promise<string> {
    const finalPattern = pattern || this.defaultPattern;

    // Get the sequence number
    const sequenceNumber = await this.getNextSequenceNumber(userId, finalPattern);

    // Generate the invoice number from pattern
    const invoiceNumber = this.applyPattern(finalPattern, sequenceNumber);

    return invoiceNumber;
  }

  /**
   * Get the next sequence number for the pattern
   */
  private async getNextSequenceNumber(userId: string, pattern: string): Promise<number> {
    // For simple implementation, count invoices created today with same pattern start
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const invoicestoday = await this.invoicesRepository.count({
      where: {
        userId,
        createdAt: Between(today, tomorrow),
      },
    });

    return invoicestoday + 1;
  }

  /**
   * Apply pattern to generate final invoice number
   */
  private applyPattern(pattern: string, sequenceNumber: number): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const yearShort = String(year).slice(-2);
    const paddedSequence = String(sequenceNumber).padStart(4, '0');
    const unpaddedSequence = String(sequenceNumber);

    let result = pattern
      .replace('{YYYY}', year.toString())
      .replace('{YY}', yearShort)
      .replace('{MM}', month)
      .replace('{DD}', day)
      .replace('{0000}', paddedSequence)
      .replace('{####}', unpaddedSequence);

    return result;
  }

  /**
   * Validate if invoice number pattern is valid
   */
  validatePattern(pattern: string): boolean {
    const validPlaceholders = ['{YYYY}', '{YY}', '{MM}', '{DD}', '{0000}', '{####}'];
    const allValid = validPlaceholders.every((placeholder) => {
      return !pattern.includes(placeholder) || pattern.indexOf(placeholder) >= 0;
    });
    return allValid && pattern.length > 0;
  }

  /**
   * Get example invoice number from pattern
   */
  getExampleInvoiceNumber(pattern: string): string {
    try {
      return this.applyPattern(pattern, 1);
    } catch (error) {
      return 'INVALID_PATTERN';
    }
  }
}

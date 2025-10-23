import { Injectable, BadRequestException } from '@nestjs/common';
import { parse } from 'csv-parse/sync';

export interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string; data?: any }>;
  imported: any[];
}

@Injectable()
export class ImportService {
  /**
   * Parse CSV file content
   */
  parseCSV(fileContent: string, options?: any): any[] {
    try {
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        ...options,
      });
      return records;
    } catch (error) {
      throw new BadRequestException(`Failed to parse CSV: ${error.message}`);
    }
  }

  /**
   * Validate and sanitize row data
   */
  validateRow(row: any, requiredFields: string[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    for (const field of requiredFields) {
      if (!row[field] || row[field].trim() === '') {
        errors.push(`Missing required field: ${field}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Process import with validation
   */
  async processImport<T>(
    records: any[],
    requiredFields: string[],
    transformFn: (row: any, index: number) => Promise<T>,
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: 0,
      failed: 0,
      errors: [],
      imported: [],
    };

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNumber = i + 2; // +2 because: 0-indexed + 1 for header + 1 for human-readable

      try {
        // Validate
        const validation = this.validateRow(row, requiredFields);
        if (!validation.valid) {
          result.failed++;
          result.errors.push({
            row: rowNumber,
            error: validation.errors.join(', '),
            data: row,
          });
          continue;
        }

        // Transform and validate
        const transformed = await transformFn(row, i);
        result.imported.push(transformed);
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          row: rowNumber,
          error: error.message,
          data: row,
        });
      }
    }

    return result;
  }

  /**
   * Generate sample CSV template
   */
  generateTemplate(fields: Array<{ name: string; example: string }>): string {
    const headers = fields.map((f) => f.name).join(',');
    const exampleRow = fields.map((f) => f.example).join(',');
    return `${headers}\n${exampleRow}`;
  }
}

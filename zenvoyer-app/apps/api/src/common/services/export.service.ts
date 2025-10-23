import { Injectable } from '@nestjs/common';

@Injectable()
export class ExportService {
  /**
   * Convert array of objects to CSV
   */
  toCSV(data: any[], columns?: string[]): string {
    if (data.length === 0) return '';

    const headers = columns || Object.keys(data[0]);
    const headerRow = headers.join(',');

    const rows = data.map((row) => {
      return headers
        .map((header) => {
          const value = row[header];
          // Handle values with commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(',');
    });

    return [headerRow, ...rows].join('\n');
  }

  /**
   * Generate CSV download response
   */
  generateCSVResponse(data: any[], filename: string, columns?: string[]) {
    const csv = this.toCSV(data, columns);
    return {
      content: csv,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    };
  }

  /**
   * Convert data to Excel-compatible format
   */
  toExcel(data: any[]): any[] {
    return data.map((row) => {
      const newRow: any = {};
      Object.keys(row).forEach((key) => {
        // Format dates
        if (row[key] instanceof Date) {
          newRow[key] = row[key].toISOString().split('T')[0];
        } else {
          newRow[key] = row[key];
        }
      });
      return newRow;
    });
  }
}

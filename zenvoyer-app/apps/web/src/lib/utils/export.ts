/**
 * Export Utilities
 * Helper functions untuk export data ke berbagai format
 */

/**
 * Export data to CSV
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string = 'export.csv'
): void {
  if (data.length === 0) return;

  // Get headers
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Escape quotes dan wrap dalam quotes jika ada koma/quote
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(',')
    ),
  ].join('\n');

  // Download
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
}

/**
 * Export data to JSON
 */
export function exportToJSON<T>(
  data: T[],
  filename: string = 'export.json'
): void {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, filename, 'application/json;charset=utf-8;');
}

/**
 * Export data to Excel (basic)
 * Note: Untuk production, gunakan library seperti xlsx
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  filename: string = 'export.xls'
): void {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);

  // Create table HTML
  const html = `
    <table>
      <thead>
        <tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${data
          .map(
            (row) =>
              `<tr>${headers.map((header) => `<td>${row[header]}</td>`).join('')}</tr>`
          )
          .join('')}
      </tbody>
    </table>
  `;

  downloadFile(html, filename, 'application/vnd.ms-excel;charset=utf-8;');
}

/**
 * Helper function untuk download file
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const link = document.createElement('a');
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Export invoices to PDF (placeholder)
 * Note: Untuk production, gunakan library seperti jsPDF
 */
export function exportInvoiceToPDF(_invoiceId: string, _filename: string = 'invoice.pdf'): void {
  // TODO: Implement PDF export menggunakan jsPDF atau library lain
  console.warn('PDF export belum diimplementasikan');
}

/**
 * Generate report dari data
 */
export interface ReportGeneratorOptions {
  title?: string;
  dateRange?: { from: string; to: string };
  summary?: Record<string, any>;
}

export function generateReport<T extends Record<string, any>>(
  data: T[],
  options: ReportGeneratorOptions = {}
): string {
  const { title, dateRange, summary } = options;

  let report = '';

  if (title) {
    report += `# ${title}\n\n`;
  }

  if (dateRange) {
    report += `Date Range: ${dateRange.from} to ${dateRange.to}\n\n`;
  }

  if (summary) {
    report += `## Summary\n`;
    Object.entries(summary).forEach(([key, value]) => {
      report += `- ${key}: ${value}\n`;
    });
    report += '\n';
  }

  report += `## Data (${data.length} rows)\n\n`;

  // Convert to markdown table
  if (data.length > 0) {
    const headers = Object.keys(data[0]);
    report += `| ${headers.join(' | ')} |\n`;
    report += `| ${headers.map(() => '---').join(' | ')} |\n`;

    data.slice(0, 100).forEach((row) => {
      report += `| ${headers.map((h) => row[h]).join(' | ')} |\n`;
    });

    if (data.length > 100) {
      report += `\n... and ${data.length - 100} more rows\n`;
    }
  }

  return report;
}

export const exportUtils = {
  exportToCSV,
  exportToJSON,
  exportToExcel,
  exportInvoiceToPDF,
  generateReport,
};

export default exportUtils;

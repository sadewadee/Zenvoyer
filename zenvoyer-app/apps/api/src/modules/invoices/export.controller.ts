import { Controller, Get, UseGuards, Req, Res, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { ExportService } from '../../common/services/export.service';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('invoices')
@Controller('invoices/export')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('JWT-auth')
export class InvoiceExportController {
  constructor(
    private invoicesService: InvoicesService,
    private exportService: ExportService,
  ) {}

  @Get('csv')
  @ApiOperation({ summary: 'Export invoices to CSV' })
  async exportToCSV(
    @Req() request: any,
    @Res() response: Response,
    @Query() paginationDto: PaginationDto,
    @Query() filters?: any,
  ) {
    const exportPagination = new PaginationDto();
    exportPagination.page = paginationDto.page || 1;
    exportPagination.limit = 10000; // Max for export
    
    const result = await this.invoicesService.getAllInvoices(
      request.user.id,
      exportPagination,
      filters,
    );

    const csvData = this.exportService.toCSV(
      result.data,
      ['invoiceNumber', 'clientName', 'invoiceDate', 'dueDate', 'totalAmount', 'status'],
    );

    response.setHeader('Content-Type', 'text/csv');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="invoices-${new Date().toISOString().split('T')[0]}.csv"`,
    );
    response.send(csvData);
  }
}

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InvoicesService } from './invoices.service';
import { RequirePermissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import {
  CreateInvoiceDto,
  UpdateInvoiceDto,
  RecordPaymentDto,
  UpdateInvoiceStatusDto,
  GenerateInvoiceNumberDto,
} from './dto/invoice.dto';

@Controller('invoices')
@UseGuards(AuthGuard('jwt'))
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  /**
   * Get all invoices with optional filters
   * Filters: status, clientId, dateFrom, dateTo
   */
  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('canViewInvoices')
  async getAllInvoices(@Req() request: any, @Query() filters?: any) {
    return this.invoicesService.getAllInvoices(request.user.id, filters);
  }

  /**
   * Get single invoice by ID
   */
  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('canViewInvoices')
  async getInvoiceById(@Req() request: any, @Param('id') invoiceId: string) {
    return this.invoicesService.getInvoiceById(request.user.id, invoiceId);
  }

  /**
   * Create a new invoice
   */
  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('canCreateInvoice')
  async createInvoice(@Req() request: any, @Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoicesService.createInvoice(request.user.id, createInvoiceDto);
  }

  /**
   * Update invoice (only draft invoices)
   */
  @Put(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('canEditInvoice')
  async updateInvoice(
    @Req() request: any,
    @Param('id') invoiceId: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ) {
    return this.invoicesService.updateInvoice(request.user.id, invoiceId, updateInvoiceDto);
  }

  /**
   * Delete invoice (only draft invoices)
   */
  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('canDeleteInvoice')
  @HttpCode(200)
  async deleteInvoice(@Req() request: any, @Param('id') invoiceId: string) {
    return this.invoicesService.deleteInvoice(request.user.id, invoiceId);
  }

  /**
   * Send invoice (change status from draft to sent)
   */
  @Post(':id/send')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('canEditInvoice')
  @HttpCode(200)
  async sendInvoice(@Req() request: any, @Param('id') invoiceId: string) {
    return this.invoicesService.sendInvoice(request.user.id, invoiceId);
  }

  /**
   * Record a payment for invoice
   */
  @Post(':id/payments')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('canEditInvoice')
  @HttpCode(200)
  async recordPayment(
    @Req() request: any,
    @Param('id') invoiceId: string,
    @Body() recordPaymentDto: RecordPaymentDto,
  ) {
    return this.invoicesService.recordPayment(request.user.id, invoiceId, recordPaymentDto);
  }

  /**
   * Update invoice status
   */
  @Put(':id/status')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('canEditInvoice')
  async updateInvoiceStatus(
    @Req() request: any,
    @Param('id') invoiceId: string,
    @Body() updateStatusDto: UpdateInvoiceStatusDto,
  ) {
    return this.invoicesService.updateInvoiceStatus(
      request.user.id,
      invoiceId,
      updateStatusDto,
    );
  }

  /**
   * Generate public share link for invoice
   */
  @Post(':id/share')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('canViewInvoices')
  @HttpCode(200)
  async generateShareLink(
    @Req() request: any,
    @Param('id') invoiceId: string,
    @Body('expiresInDays') expiresInDays?: number,
  ) {
    return this.invoicesService.generateShareLink(
      request.user.id,
      invoiceId,
      expiresInDays || 30,
    );
  }

  /**
   * Get invoice statistics for dashboard
   */
  @Get('stats/summary')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('canViewInvoices')
  async getInvoiceStatistics(@Req() request: any) {
    return this.invoicesService.getInvoiceStatistics(request.user.id);
  }

  /**
   * Get public invoice by share token (no auth required)
   */
  @Get('public/:token')
  async getPublicInvoice(@Param('token') shareToken: string) {
    return this.invoicesService.getPublicInvoice(shareToken);
  }
}

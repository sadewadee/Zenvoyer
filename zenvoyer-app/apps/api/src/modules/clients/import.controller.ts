import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Req,
  Get,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { ImportService } from '../../common/services/import.service';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';
import { RequireSubscription } from '../../common/decorators';

@ApiTags('clients')
@Controller('clients/import')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('JWT-auth')
export class ClientImportController {
  constructor(
    private clientsService: ClientsService,
    private importService: ImportService,
  ) {}

  @Get('template')
  @ApiOperation({ summary: 'Download CSV import template' })
  async downloadTemplate(@Res() response: Response) {
    const template = this.importService.generateTemplate([
      { name: 'name', example: 'Acme Corporation' },
      { name: 'email', example: 'contact@acme.com' },
      { name: 'phoneNumber', example: '+1234567890' },
      { name: 'address', example: '123 Main St, City, Country' },
      { name: 'taxId', example: 'TAX-12345' },
      { name: 'currency', example: 'USD' },
      { name: 'tags', example: 'vip,enterprise' },
      { name: 'notes', example: 'Important client' },
    ]);

    response.setHeader('Content-Type', 'text/csv');
    response.setHeader('Content-Disposition', 'attachment; filename="clients-import-template.csv"');
    response.send(template);
  }

  @Post('csv')
  @UseGuards(SubscriptionGuard)
  @RequireSubscription('pro')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Import clients from CSV (Pro only)' })
  @ApiConsumes('multipart/form-data')
  async importFromCSV(
    @UploadedFile() file: Express.Multer.File,
    @Req() request: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!file.originalname.endsWith('.csv')) {
      throw new BadRequestException('Only CSV files are allowed');
    }

    const fileContent = file.buffer.toString('utf-8');
    const records = this.importService.parseCSV(fileContent);

    if (records.length === 0) {
      throw new BadRequestException('CSV file is empty');
    }

    if (records.length > 1000) {
      throw new BadRequestException('Maximum 1000 records allowed per import');
    }

    const result = await this.importService.processImport(
      records,
      ['name'], // Only name is required
      async (row, index) => {
        // Transform CSV row to CreateClientDto
        const clientData = {
          name: row.name,
          email: row.email || null,
          phoneNumber: row.phoneNumber || null,
          address: row.address || null,
          taxId: row.taxId || null,
          currency: row.currency || 'USD',
          tags: row.tags ? row.tags.split(',').map((t: string) => t.trim()) : [],
          notes: row.notes || null,
        };

        // Validate email if provided
        if (clientData.email && !this.isValidEmail(clientData.email)) {
          throw new Error(`Invalid email format: ${clientData.email}`);
        }

        // Create client
        return this.clientsService.create(request.user.id, clientData);
      },
    );

    return {
      message: 'Import completed',
      ...result,
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

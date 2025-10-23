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
import { ProductsService } from './products.service';
import { ImportService } from '../../common/services/import.service';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';
import { RequireSubscription } from '../../common/decorators';

@ApiTags('products')
@Controller('products/import')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('JWT-auth')
export class ProductImportController {
  constructor(
    private productsService: ProductsService,
    private importService: ImportService,
  ) {}

  @Get('template')
  @ApiOperation({ summary: 'Download CSV import template' })
  async downloadTemplate(@Res() response: Response) {
    const template = this.importService.generateTemplate([
      { name: 'name', example: 'Web Development Service' },
      { name: 'description', example: 'Custom website development' },
      { name: 'defaultPrice', example: '1000.00' },
      { name: 'sku', example: 'WEB-DEV-001' },
      { name: 'category', example: 'Services' },
      { name: 'notes', example: 'Hourly rate available' },
    ]);

    response.setHeader('Content-Type', 'text/csv');
    response.setHeader('Content-Disposition', 'attachment; filename="products-import-template.csv"');
    response.send(template);
  }

  @Post('csv')
  @UseGuards(SubscriptionGuard)
  @RequireSubscription('pro')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Import products from CSV (Pro only)' })
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
      ['name', 'defaultPrice'], // Required fields
      async (row, index) => {
        // Parse price
        const price = parseFloat(row.defaultPrice);
        if (isNaN(price) || price < 0) {
          throw new Error(`Invalid price: ${row.defaultPrice}`);
        }

        // Transform CSV row to CreateProductDto
        const productData = {
          name: row.name,
          description: row.description || null,
          defaultPrice: price,
          sku: row.sku || null,
          category: row.category || null,
          notes: row.notes || null,
        };

        // Create product
        return this.productsService.create(request.user.id, productData);
      },
    );

    return {
      message: 'Import completed',
      ...result,
    };
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice, InvoiceItem, Payment } from '../../database/entities/invoice.entity';
import { Client } from '../../database/entities/client.entity';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { InvoiceCalculationService } from './services/invoice-calculation.service';
import { InvoiceNumberingService } from './services/invoice-numbering.service';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, InvoiceItem, Payment, Client])],
  controllers: [InvoicesController],
  providers: [InvoicesService, InvoiceCalculationService, InvoiceNumberingService],
  exports: [InvoicesService],
})
export class InvoicesModule {}

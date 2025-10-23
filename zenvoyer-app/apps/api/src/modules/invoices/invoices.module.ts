import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice, InvoiceItem, Payment } from '../../database/entities/invoice.entity';
import { Client } from '../../database/entities/client.entity';
import { Product } from '../../database/entities/product.entity';
import { SubUserPermission } from '../../database/entities/sub-user-permission.entity';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { InvoiceCalculationService } from './services/invoice-calculation.service';
import { InvoiceNumberingService } from './services/invoice-numbering.service';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { LimitGuard } from '../../common/guards/limit.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Invoice,
      InvoiceItem,
      Payment,
      Client,
      Product,
      SubUserPermission,
    ]),
  ],
  controllers: [InvoicesController],
  providers: [
    InvoicesService,
    InvoiceCalculationService,
    InvoiceNumberingService,
    PermissionsGuard,
    LimitGuard,
  ],
  exports: [InvoicesService],
})
export class InvoicesModule {}

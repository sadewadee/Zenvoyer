import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  User,
  SubUserPermission,
  AdminActivityLog,
  Invoice,
  InvoiceItem,
  Payment,
  Client,
  Product,
} from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      SubUserPermission,
      AdminActivityLog,
      Invoice,
      InvoiceItem,
      Payment,
      Client,
      Product,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}

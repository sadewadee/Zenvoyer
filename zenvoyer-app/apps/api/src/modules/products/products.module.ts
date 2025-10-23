import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../../database/entities/product.entity';
import { Client } from '../../database/entities/client.entity';
import { Invoice } from '../../database/entities/invoice.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { LimitGuard } from '../../common/guards/limit.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Client, Invoice])],
  controllers: [ProductsController],
  providers: [ProductsService, LimitGuard],
  exports: [ProductsService],
})
export class ProductsModule {}

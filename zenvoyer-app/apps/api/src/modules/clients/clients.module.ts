import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from '../../database/entities/client.entity';
import { Product } from '../../database/entities/product.entity';
import { Invoice } from '../../database/entities/invoice.entity';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { LimitGuard } from '../../common/guards/limit.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Client, Product, Invoice])],
  controllers: [ClientsController],
  providers: [ClientsService, LimitGuard],
  exports: [ClientsService],
})
export class ClientsModule {}

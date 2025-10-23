import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Invoice, Payment } from '../../database/entities/invoice.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, Payment])],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}

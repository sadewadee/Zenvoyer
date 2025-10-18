import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from '../../database/entities/invoice.entity';
import { User } from '../../database/entities/user.entity';
import { Client } from '../../database/entities/client.entity';
import { AdminActivityLog } from '../../database/entities/admin-activity-log.entity';
import { DashboardsService } from './dashboards.service';
import { DashboardsController } from './dashboards.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Invoice,
      User,
      Client,
      AdminActivityLog,
    ]),
  ],
  controllers: [DashboardsController],
  providers: [DashboardsService],
  exports: [DashboardsService],
})
export class DashboardsModule {}

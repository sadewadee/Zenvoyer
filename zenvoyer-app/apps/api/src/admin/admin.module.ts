import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { AdminActivityLog } from '../database/entities/admin-activity-log.entity';
import { AdminService } from './admin.service';
import { SuperAdminController } from './super-admin.controller';
import { AdminController } from './admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, AdminActivityLog])],
  controllers: [SuperAdminController, AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}

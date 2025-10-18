import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubUserPermission } from '../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([SubUserPermission])],
  exports: [TypeOrmModule],
})
export class CommonModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from '../../database/entities/invoice.entity';
import { User } from '../../database/entities/user.entity';
import {
  PdfGenerationService,
  EmailService,
  EmailTemplatesService,
} from './services';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, User])],
  controllers: [NotificationsController],
  providers: [PdfGenerationService, EmailService, EmailTemplatesService],
  exports: [PdfGenerationService, EmailService, EmailTemplatesService],
})
export class NotificationsModule {}

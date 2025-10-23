import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';

export enum NotificationType {
  INVOICE_CREATED = 'invoice_created',
  INVOICE_PAID = 'invoice_paid',
  PAYMENT_RECEIVED = 'payment_received',
  INVOICE_OVERDUE = 'invoice_overdue',
  CLIENT_CREATED = 'client_created',
  SYSTEM_ALERT = 'system_alert',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column({ type: 'boolean', default: false })
  read: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}

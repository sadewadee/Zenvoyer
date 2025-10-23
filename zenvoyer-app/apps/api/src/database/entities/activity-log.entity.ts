import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';

export enum ActivityType {
  INVOICE_CREATED = 'invoice_created',
  INVOICE_UPDATED = 'invoice_updated',
  INVOICE_DELETED = 'invoice_deleted',
  INVOICE_SENT = 'invoice_sent',
  PAYMENT_RECEIVED = 'payment_received',
  CLIENT_CREATED = 'client_created',
  CLIENT_UPDATED = 'client_updated',
  PRODUCT_CREATED = 'product_created',
  SETTINGS_UPDATED = 'settings_updated',
  LOGIN = 'login',
  LOGOUT = 'logout',
}

@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column({
    type: 'enum',
    enum: ActivityType,
  })
  type: ActivityType;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;
}

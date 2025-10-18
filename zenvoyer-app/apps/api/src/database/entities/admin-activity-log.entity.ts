import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';

export enum ActivityAction {
  USER_CREATED = 'user_created',
  USER_BANNED = 'user_banned',
  USER_UNBANNED = 'user_unbanned',
  USER_DELETED = 'user_deleted',
  ADMIN_CREATED = 'admin_created',
  ADMIN_DELETED = 'admin_deleted',
  SUPPORT_TICKET_CREATED = 'support_ticket_created',
  SUPPORT_TICKET_RESOLVED = 'support_ticket_resolved',
  INVOICE_CREATED = 'invoice_created',
  INVOICE_UPDATED = 'invoice_updated',
  PAYMENT_RECEIVED = 'payment_received',
  SUBSCRIPTION_UPGRADED = 'subscription_upgraded',
  SUBSCRIPTION_DOWNGRADED = 'subscription_downgraded',
  LOGIN = 'login',
  LOGOUT = 'logout',
  PASSWORD_CHANGED = 'password_changed',
  SETTINGS_UPDATED = 'settings_updated',
}

@Entity('admin_activity_logs')
export class AdminActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  adminId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  admin: User;

  @Column({ type: 'uuid', nullable: true })
  targetUserId: string;

  @Column({
    type: 'enum',
    enum: ActivityAction,
  })
  action: ActivityAction;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;
}

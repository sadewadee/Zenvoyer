import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';
import { Client } from './client.entity';

export enum RecurringFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

@Entity('recurring_invoices')
export class RecurringInvoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'uuid' })
  clientId: string;

  @ManyToOne(() => Client, { onDelete: 'CASCADE' })
  client: Client;

  @Column({ type: 'varchar', length: 100 })
  invoiceNumberPattern: string;

  @Column({
    type: 'enum',
    enum: RecurringFrequency,
  })
  frequency: RecurringFrequency;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'date' })
  nextInvoiceDate: Date;

  @Column({ type: 'date', nullable: true })
  lastInvoiceDate: Date;

  @Column({ type: 'jsonb' })
  invoiceTemplate: any; // Template for invoice creation

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  invoicesGenerated: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

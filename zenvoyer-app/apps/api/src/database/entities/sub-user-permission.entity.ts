import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';

@Entity('sub_user_permissions')
export class SubUserPermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  subUserId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  subUser: User;

  @Column({ type: 'boolean', default: false })
  canViewInvoices: boolean;

  @Column({ type: 'boolean', default: false })
  canCreateInvoice: boolean;

  @Column({ type: 'boolean', default: false })
  canEditInvoice: boolean;

  @Column({ type: 'boolean', default: false })
  canDeleteInvoice: boolean;

  @Column({ type: 'boolean', default: false })
  canManageClients: boolean;

  @Column({ type: 'boolean', default: false })
  canManageProducts: boolean;

  @Column({ type: 'boolean', default: false })
  canViewReports: boolean;

  @Column({ type: 'boolean', default: false })
  canEditSettings: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

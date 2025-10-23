import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1704067200000 implements MigrationInterface {
  name = 'InitialSchema1704067200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.query(`
      CREATE TYPE user_role_enum AS ENUM ('super_admin', 'admin', 'sub_admin', 'user', 'sub_user');
      CREATE TYPE subscription_plan_enum AS ENUM ('free', 'pro');
      
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" varchar(255) NOT NULL UNIQUE,
        "password" varchar(255) NOT NULL,
        "firstName" varchar(255),
        "lastName" varchar(255),
        "phoneNumber" varchar(255),
        "role" user_role_enum NOT NULL DEFAULT 'user',
        "emailVerified" boolean NOT NULL DEFAULT false,
        "emailVerificationToken" varchar(255),
        "passwordResetToken" varchar(255),
        "passwordResetExpires" timestamp,
        "isBanned" boolean NOT NULL DEFAULT false,
        "banReason" text,
        "parentUserId" uuid,
        "subscriptionPlan" subscription_plan_enum NOT NULL DEFAULT 'free',
        "subscriptionStartDate" timestamp,
        "subscriptionEndDate" timestamp,
        "subscriptionActive" boolean NOT NULL DEFAULT false,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        "lastLoginAt" timestamp,
        CONSTRAINT "FK_users_parent" FOREIGN KEY ("parentUserId") REFERENCES "users"("id") ON DELETE CASCADE
      );
      
      CREATE INDEX "IDX_users_email" ON "users"("email");
      CREATE INDEX "IDX_users_role" ON "users"("role");
      CREATE INDEX "IDX_users_subscription" ON "users"("subscriptionPlan");
    `);

    // Create clients table
    await queryRunner.query(`
      CREATE TABLE "clients" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "name" varchar(255) NOT NULL,
        "email" varchar(255),
        "phoneNumber" varchar(255),
        "address" text,
        "taxId" varchar(100),
        "currency" varchar(3) NOT NULL DEFAULT 'USD',
        "tags" text[],
        "notes" text,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_clients_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      );
      
      CREATE INDEX "IDX_clients_userId" ON "clients"("userId");
      CREATE INDEX "IDX_clients_isActive" ON "clients"("isActive");
    `);

    // Create products table
    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "name" varchar(255) NOT NULL,
        "description" text,
        "defaultPrice" decimal(12,2) NOT NULL,
        "sku" varchar(100),
        "category" varchar(50),
        "notes" text,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_products_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      );
      
      CREATE INDEX "IDX_products_userId" ON "products"("userId");
      CREATE INDEX "IDX_products_isActive" ON "products"("isActive");
    `);

    // Create invoices table
    await queryRunner.query(`
      CREATE TYPE invoice_status_enum AS ENUM ('draft', 'sent', 'viewed', 'paid', 'partial', 'overdue');
      
      CREATE TABLE "invoices" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "clientId" uuid NOT NULL,
        "invoiceNumber" varchar(100) NOT NULL,
        "invoiceDate" date NOT NULL,
        "dueDate" date NOT NULL,
        "currency" varchar(3) NOT NULL DEFAULT 'USD',
        "subtotal" decimal(12,2) NOT NULL DEFAULT 0,
        "taxAmount" decimal(12,2) NOT NULL DEFAULT 0,
        "taxRate" decimal(5,2) NOT NULL DEFAULT 0,
        "discountAmount" decimal(12,2) NOT NULL DEFAULT 0,
        "discountRate" decimal(5,2) NOT NULL DEFAULT 0,
        "totalAmount" decimal(12,2) NOT NULL DEFAULT 0,
        "amountPaid" decimal(12,2) NOT NULL DEFAULT 0,
        "status" invoice_status_enum NOT NULL DEFAULT 'draft',
        "notes" text,
        "termsAndConditions" text,
        "profitMargin" decimal(12,2),
        "profitMarginPercentage" decimal(5,2),
        "publicShareToken" varchar(255),
        "isPubliclyShared" boolean NOT NULL DEFAULT false,
        "publicShareExpiresAt" timestamp,
        "viewedAt" timestamp,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_invoices_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_invoices_client" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE
      );
      
      CREATE INDEX "IDX_invoices_userId" ON "invoices"("userId");
      CREATE INDEX "IDX_invoices_clientId" ON "invoices"("clientId");
      CREATE INDEX "IDX_invoices_status" ON "invoices"("status");
      CREATE INDEX "IDX_invoices_invoiceDate" ON "invoices"("invoiceDate");
      CREATE INDEX "IDX_invoices_dueDate" ON "invoices"("dueDate");
      CREATE UNIQUE INDEX "IDX_invoices_publicShareToken" ON "invoices"("publicShareToken");
    `);

    // Create invoice_items table
    await queryRunner.query(`
      CREATE TABLE "invoice_items" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "invoiceId" uuid NOT NULL,
        "productId" uuid,
        "description" varchar(255) NOT NULL,
        "quantity" decimal(10,2) NOT NULL,
        "unitPrice" decimal(12,2) NOT NULL,
        "total" decimal(12,2) NOT NULL,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_invoice_items_invoice" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE
      );
      
      CREATE INDEX "IDX_invoice_items_invoiceId" ON "invoice_items"("invoiceId");
    `);

    // Create payments table
    await queryRunner.query(`
      CREATE TABLE "payments" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "invoiceId" uuid NOT NULL,
        "amount" decimal(12,2) NOT NULL,
        "paymentMethod" varchar(100) NOT NULL,
        "transactionId" varchar(255),
        "notes" text,
        "status" varchar(50) NOT NULL DEFAULT 'completed',
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_payments_invoice" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE
      );
      
      CREATE INDEX "IDX_payments_invoiceId" ON "payments"("invoiceId");
      CREATE INDEX "IDX_payments_status" ON "payments"("status");
    `);

    // Create sub_user_permissions table
    await queryRunner.query(`
      CREATE TABLE "sub_user_permissions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "subUserId" uuid NOT NULL,
        "canCreateInvoice" boolean NOT NULL DEFAULT false,
        "canEditInvoice" boolean NOT NULL DEFAULT false,
        "canDeleteInvoice" boolean NOT NULL DEFAULT false,
        "canViewInvoice" boolean NOT NULL DEFAULT false,
        "canCreateClient" boolean NOT NULL DEFAULT false,
        "canEditClient" boolean NOT NULL DEFAULT false,
        "canDeleteClient" boolean NOT NULL DEFAULT false,
        "canViewReports" boolean NOT NULL DEFAULT false,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_sub_user_permissions_user" FOREIGN KEY ("subUserId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_sub_user_permissions_userId" UNIQUE ("subUserId")
      );
      
      CREATE INDEX "IDX_sub_user_permissions_subUserId" ON "sub_user_permissions"("subUserId");
    `);

    // Create admin_activity_logs table
    await queryRunner.query(`
      CREATE TABLE "admin_activity_logs" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "adminId" uuid NOT NULL,
        "action" varchar(255) NOT NULL,
        "targetUserId" uuid,
        "details" text,
        "ipAddress" varchar(45),
        "userAgent" text,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_admin_activity_logs_admin" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE CASCADE
      );
      
      CREATE INDEX "IDX_admin_activity_logs_adminId" ON "admin_activity_logs"("adminId");
      CREATE INDEX "IDX_admin_activity_logs_createdAt" ON "admin_activity_logs"("createdAt");
    `);

    // Enable uuid-ossp extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "admin_activity_logs"`);
    await queryRunner.query(`DROP TABLE "sub_user_permissions"`);
    await queryRunner.query(`DROP TABLE "payments"`);
    await queryRunner.query(`DROP TABLE "invoice_items"`);
    await queryRunner.query(`DROP TABLE "invoices"`);
    await queryRunner.query(`DROP TYPE "invoice_status_enum"`);
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TABLE "clients"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "subscription_plan_enum"`);
    await queryRunner.query(`DROP TYPE "user_role_enum"`);
  }
}

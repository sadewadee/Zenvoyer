import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global pipes
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  // CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGIN') || '*',
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Zenvoyer API')
    .setDescription('Professional Invoice Management Platform API')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('invoices', 'Invoice management')
    .addTag('clients', 'Client management')
    .addTag('products', 'Product management')
    .addTag('payments', 'Payment processing')
    .addTag('dashboards', 'Dashboard analytics')
    .addTag('users', 'User management')
    .addTag('admin', 'Admin operations')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Zenvoyer API Documentation',
    customfavIcon: 'https://zenvoyer.com/favicon.ico',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = configService.get('PORT') || 3001;
  await app.listen(port);
  console.log(`✓ Zenvoyer API running on http://localhost:${port}`);
  console.log(`✓ Swagger docs available at http://localhost:${port}/api/docs`);
}

bootstrap();

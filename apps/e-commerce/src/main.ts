import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@app/logger';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks();

  const host = process.env.APP_HOST || '127.0.0.1';
  const port = parseInt(process.env.APP_PORT || '3000', 10);

  const logger = new Logger();

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips unknown properties
      forbidNonWhitelisted: true, // Rejects unknown properties
      transform: true, // Automatically transforms payloads to DTO instances
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('E-commerce API')
    .setDescription('The E-commerce API description')
    .setVersion('2.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  try {
    await app.listen(port, host);
    logger.log(`🚀 Server running on http://${host}:${port}`, 'Bootstrap');
  } catch (error) {
    logger.error('Error starting the server', error.stack, 'Bootstrap');
  }
}
bootstrap();

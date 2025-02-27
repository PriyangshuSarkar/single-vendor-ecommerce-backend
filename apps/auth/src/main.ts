import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AuthModule } from './auth.module';
import { Logger } from '@app/logger';
import { LoggingInterceptor } from './logger/logger.interceptor';

async function bootstrap() {
  const host = process.env.AUTH_HOST || '127.0.0.1';
  const port = parseInt(process.env.AUTH_PORT || '4000', 10);
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthModule,
    {
      transport: Transport.TCP,
      options: {
        host,
        port,
      },
    },
  );

  app.useGlobalInterceptors(new LoggingInterceptor(new Logger()));

  app.enableShutdownHooks();

  const logger = new Logger();
  try {
    await app.listen();
    logger.log(`🚀 Auth Microservice running on ${host}:${port}`, 'Bootstrap');
  } catch (error) {
    logger.error('Error starting the microservice', error.stack, 'Bootstrap');
  }
}

bootstrap();

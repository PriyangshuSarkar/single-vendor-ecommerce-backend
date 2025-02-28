import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@app/logger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks();

  const host = process.env.APP_HOST || '127.0.0.1';
  const port = parseInt(process.env.APP_PORT || '3000', 10);

  const logger = new Logger();

  app.use(cookieParser());
  try {
    await app.listen(port, host);
    logger.log(`🚀 Server running on http://${host}:${port}`, 'Bootstrap');
  } catch (error) {
    logger.error('Error starting the server', error.stack, 'Bootstrap');
  }
}
bootstrap();

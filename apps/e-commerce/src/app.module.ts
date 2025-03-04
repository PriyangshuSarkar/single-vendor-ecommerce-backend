import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { CursorUtil, ErrorUtil, FileUtil } from './utils';
import { Logger, LoggerModule } from '@app/logger';
import { LoggerMiddleware } from './logger/logger.middleware';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AddressModule } from './address/address.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true, // ✅ Makes ConfigService available across the app
    }),
    JwtModule.register({}),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AddressModule,
  ],
  controllers: [AppController],
  providers: [AppService, ErrorUtil, FileUtil, Logger, CursorUtil],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*'); // Apply LoggerMiddleware to all routes
  }
}

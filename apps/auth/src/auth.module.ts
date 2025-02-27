import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import {
  CredentialUtil,
  ErrorUtil,
  HashUtil,
  JwtUtil,
  OtpUtil,
  SlugUtil,
} from './utils';
import { SessionUtil } from './utils/session.utils';
import { LoggerModule } from '@app/logger';
import { PrismaModule } from '@app/prisma';

@Module({
  imports: [
    LoggerModule,
    PrismaModule,
    JwtModule.register({}),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    ErrorUtil,
    JwtUtil,
    OtpUtil,
    HashUtil,
    CredentialUtil,
    SlugUtil,
    SessionUtil,
  ],
})
export class AuthModule {}

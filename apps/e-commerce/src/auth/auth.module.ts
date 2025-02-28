import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthGuard } from './auth.guard';
import { ErrorUtil } from '../utils';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}),
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('AUTH_HOST', '127.0.0.1'),
            port: configService.get<number>('AUTH_PORT', 4000),
          },
        }),
        inject: [ConfigService],
      },
    ]),
    // AuthModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, ErrorUtil],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}

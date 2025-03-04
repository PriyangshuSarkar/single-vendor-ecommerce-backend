import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '@app/prisma';
import { ErrorUtil, FileUtil } from '../utils';
import { Logger } from '@app/logger';

@Module({
  imports: [AuthModule, PrismaModule, JwtModule.register({})],
  controllers: [AddressController],
  providers: [AddressService, ErrorUtil, FileUtil, Logger],
})
export class AddressModule {}

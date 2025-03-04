import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ErrorUtil, FileUtil } from '../utils';
import { PrismaModule } from '@app/prisma';
import { AuthModule } from '../auth/auth.module';
import { SlugUtil } from './utils';
import { Logger } from '@app/logger';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [AuthModule, PrismaModule, JwtModule.register({})],
  controllers: [UserController],
  providers: [UserService, ErrorUtil, FileUtil, SlugUtil, Logger],
})
export class UserModule {}

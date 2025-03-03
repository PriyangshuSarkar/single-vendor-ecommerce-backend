import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ErrorUtil, FileUtil } from '../utils';
import { PrismaService } from '@app/prisma';
import { AuthModule } from '../auth/auth.module';
import { SlugUtil } from './utils';

@Module({
  imports: [AuthModule],
  controllers: [UserController],
  providers: [UserService, ErrorUtil, PrismaService, FileUtil, SlugUtil],
})
export class UserModule {}

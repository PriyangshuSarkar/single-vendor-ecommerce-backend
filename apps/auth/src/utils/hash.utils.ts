import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { ErrorUtil } from './error.utils';

@Injectable()
export class HashUtil {
  private readonly SALT_ROUNDS: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly errorUtil: ErrorUtil,
  ) {
    this.SALT_ROUNDS = parseInt(
      this.configService.get<string>('SALT_ROUNDS', '12'),
      10,
    );
  }

  async hash(s: string) {
    try {
      return await bcrypt.hash(s, this.SALT_ROUNDS);
    } catch (error) {
      this.errorUtil.handleError(error);
    }
  }

  async compare(s: string, hash: string) {
    try {
      return await bcrypt.compare(s, hash);
    } catch (error) {
      this.errorUtil.handleError(error);
    }
  }
}

import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { ErrorUtil } from './error.utils';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtUtil {
  private readonly JWT_SECRET: string;
  private readonly JWT_EXPIRATION_TIME: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly errorUtil: ErrorUtil,
    private readonly jwtService: JwtService,
  ) {
    this.JWT_SECRET = this.configService.get<string>(
      'JWT_SECRET',
      'defaultSecret',
    ); // Added fallback
    this.JWT_EXPIRATION_TIME = this.configService.get<string>(
      'JWT_EXPIRATION_TIME',
      '1h',
    );
  }

  async sign(payload: object) {
    try {
      return await this.jwtService.signAsync(payload, {
        secret: this.JWT_SECRET,
        expiresIn: this.JWT_EXPIRATION_TIME,
      });
    } catch (error) {
      this.errorUtil.handleError(error);
    }
  }

  async verify(token: string) {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: this.JWT_SECRET,
      });
    } catch (error) {
      this.errorUtil.handleError(error);
    }
  }
}

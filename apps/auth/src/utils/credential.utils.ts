import { ConfigService } from '@nestjs/config';
import { CredentialType, Prisma } from '@prisma/client';
import { OtpUtil } from './otp.utils';
import { Injectable } from '@nestjs/common';
import { ErrorUtil } from './error.utils';
import * as uuid from 'uuid';

@Injectable()
export class CredentialUtil {
  constructor(
    private readonly errorUtil: ErrorUtil,
    private readonly otpUtil: OtpUtil,
    private readonly config: ConfigService,
  ) {}

  async createCredential(
    tx: Prisma.TransactionClient,
    userId: string,
    value: string,
    type: CredentialType,
  ) {
    try {
      const { otp, otpExpiresAt } = await this.otpUtil.createOtpData(
        this.config.get('OTP_EXPIRY_MINUTES'),
      );
      await tx.credential.create({
        data: {
          id: uuid.v7(),
          user: { connect: { id: userId } },
          type,
          value,
          otp,
          otpExpiresAt,
          isVerified: false,
          isPrimary: true,
          verifiedAt: null,
        },
      });
    } catch (error) {
      this.errorUtil.handleError(error);
    }
  }

  async cleanupUnverifiedCredentials(
    tx: Prisma.TransactionClient,
    value?: string,
    type?: CredentialType,
  ) {
    try {
      if (!value || !type) return;

      await tx.credential.deleteMany({
        where: {
          value,
          type,
          isVerified: false,
          deletedAt: null,
        },
      });
    } catch (error) {
      this.errorUtil.handleError(error);
    }
  }
}

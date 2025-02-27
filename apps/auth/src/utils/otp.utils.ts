import { PrismaService } from '@app/prisma';
import { Injectable } from '@nestjs/common';
import { ErrorUtil } from './error.utils';

// import { randomBytes } from 'crypto';

@Injectable()
export class OtpUtil {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorUtil: ErrorUtil,
  ) {}

  async generateOtp() {
    try {
      // Replace this with actual OTP generation logic
      return '123456'; // Temporary for now
      // return (parseInt(randomBytes(3).toString('hex'), 16) % 1000000)
      //   .toString()
      //   .padStart(6, '0');
    } catch (error) {
      this.errorUtil.handleError(error);
    }
  }

  async createOtpData(expiryMinutes: number) {
    try {
      return {
        otp: await this.generateOtp(),
        otpExpiresAt: new Date(Date.now() + expiryMinutes * 60 * 1000),
      };
    } catch (error) {
      this.errorUtil.handleError(error);
    }
  }

  async verifyOtp(value: string, otp: string) {
    try {
      // Fetch OTP data from DB for the user
      const credential = await this.prisma.credential.findUnique({
        where: {
          value,
          otp,
          otpExpiresAt: { gte: new Date() }, // Ensure OTP is not expired
          deletedAt: null,
        },
        include: {
          user: true,
        },
      });

      return credential; // OTP is valid
    } catch (error) {
      this.errorUtil.handleError(error);
    }
  }
}

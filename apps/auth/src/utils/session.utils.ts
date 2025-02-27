import { PrismaService } from '@app/prisma';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ErrorUtil } from './error.utils';
import { HashUtil } from './hash.utils';
import { JwtUtil } from './jwt.utils';

import * as uuid from 'uuid';

@Injectable()
export class SessionUtil {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorUtil: ErrorUtil,
    private readonly hashUtil: HashUtil,
    private readonly jwtUtil: JwtUtil,
  ) {}

  async createSession(userId: string, userAgent?: string, ipAddress?: string) {
    try {
      const accessToken = await this.jwtUtil.sign({ userId });

      const refreshToken = uuid.v7(); // Generate a unique refresh token
      const refreshTokenExpiry = new Date();
      refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // Expires in 7 days
      const hashedRefreshToken = await this.hashUtil.hash(refreshToken);

      // Store session
      const session = await this.prisma.session.create({
        data: {
          token: hashedRefreshToken,
          expiresAt: refreshTokenExpiry,
          userAgent,
          ipAddress,
          userId,
        },
      });

      return {
        accessToken,
        refreshToken, // Return raw refresh token
        sessionId: session.id,
      };
    } catch (error) {
      this.errorUtil.handleError(error);
    }
  }

  async validateAccessToken(accessToken: string) {
    try {
      // Verify token signature
      const decoded = await this.jwtUtil.verify(accessToken);

      if (!decoded || !decoded.userId) {
        throw new UnauthorizedException('Invalid access token');
      }

      return decoded; // Return userId and other claims
    } catch (error) {
      this.errorUtil.handleError(error);
    }
  }

  async refreshAccessToken(
    sessionId: string,
    refreshToken: string,
    userId?: string,
  ) {
    try {
      const session = await this.prisma.session.findFirst({
        where: { id: sessionId, userId, expiresAt: { gte: new Date() } },
      });

      if (!session) throw new UnauthorizedException('Invalid refresh token');

      const isValid = await this.hashUtil.compare(refreshToken, session.token);
      if (!isValid) throw new UnauthorizedException('Invalid refresh token');

      // Generate new access token
      const newAccessToken = await this.jwtUtil.sign({ userId });

      return newAccessToken;
    } catch (error) {
      this.errorUtil.handleError(error);
    }
  }

  async revokeSession(sessionId: string | undefined, userId?: string) {
    try {
      if (!userId || !sessionId)
        throw new UnauthorizedException('Provide userId or sessionId');
      await this.prisma.session.deleteMany({
        where: sessionId ? { id: sessionId } : { userId },
      });
      return { message: 'Session revoked' };
    } catch (error) {
      this.errorUtil.handleError(error);
    }
  }
}

import { PrismaService } from '@app/prisma';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ErrorUtil } from './error.utils';
import { HashUtil } from './hash.utils';
import { JwtUtil } from './jwt.utils';

import * as uuid from 'uuid';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';

@Injectable()
export class SessionUtil {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorUtil: ErrorUtil,
    private readonly hashUtil: HashUtil,
    private readonly jwtUtil: JwtUtil,
    private readonly configService: ConfigService,
  ) {}

  async createSession(
    userId: string,
    userSlug: string,
    userRole: string,
    userAgent?: string,
    ipAddress?: string,
  ) {
    try {
      const accessToken = await this.jwtUtil.sign({
        id: userId,
        slug: userSlug,
        role: userRole,
      });

      const refreshToken = uuid.v7(); // Generate a unique refresh token
      const sessionExpiryDays = this.configService.get<number>(
        'SESSION_EXPIRY_DAYS',
        30,
      );

      const refreshTokenExpiry = new Date();
      refreshTokenExpiry.setDate(
        refreshTokenExpiry.getDate() + sessionExpiryDays,
      );

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

      if (!decoded) {
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
      const sessionExpiryDays = this.configService.get<number>(
        'SESSION_EXPIRY_DAYS',
        30,
      );

      const now = new Date();
      const newExpiryDate = new Date(now);
      newExpiryDate.setDate(now.getDate() + sessionExpiryDays);

      return await this.prisma.$transaction(async (tx) => {
        const session = await tx.session.findFirst({
          where: {
            id: sessionId,
            ...(userId && { userId }), // Conditionally add userId filter
            expiresAt: { gte: now },
            deletedAt: null,
          },
          select: { token: true, userId: true }, // Only select needed fields
        });

        if (!session) throw new UnauthorizedException('Invalid session');

        const isValid = await this.hashUtil.compare(
          refreshToken,
          session.token,
        );
        if (!isValid) throw new UnauthorizedException('Invalid refresh token');

        // Update session and generate token in parallel
        const [updatedSession, accessToken] = await Promise.all([
          tx.session.update({
            // Ensure correct type
            where: { id: sessionId },
            data: { expiresAt: newExpiryDate },
            select: { id: true }, // Minimize data returned
          }),
          this.jwtUtil.sign({ userId: session.userId }),
        ]);

        return { accessToken, refreshToken, sessionId: updatedSession.id };
      });
    } catch (error) {
      // Rethrow specific errors, handle unexpected ones
      if (error instanceof UnauthorizedException) throw error;
      this.errorUtil.handleError(error);
      throw new UnauthorizedException('Session refresh failed');
    }
  }

  async revokeSession(sessionId: string | undefined, userId?: string) {
    try {
      if (!userId && !sessionId)
        throw new UnauthorizedException('Provide userId or sessionId');

      const where: Prisma.SessionWhereInput = {
        deletedAt: null,
      };
      if (userId) where.userId = userId;
      if (sessionId) where.id = sessionId;

      await this.prisma.session.updateMany({
        where,
        data: {
          deletedAt: new Date(),
        },
      });

      return { message: 'Session revoked' };
    } catch (error) {
      this.errorUtil.handleError(error);
    }
  }
}

import { PrismaService } from '@app/prisma';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as uuid from 'uuid';
import {
  CredentialUtil,
  ErrorUtil,
  JwtUtil,
  OtpUtil,
  HashUtil,
  SlugUtil,
  SessionUtil,
} from './utils';
import { Prisma, Role } from '@prisma/client';
import {
  AddCredentialPayloadDto,
  LoginPayloadDto,
  LogoutPayloadDto,
  RefreshAccessTokenPayloadDto,
  RegisterPayloadDto,
  ValidateAccessTokenPayloadDto,
  VerifyOtpPayloadDto,
} from '@app/dtos';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly errorUtil: ErrorUtil,
    private readonly otpUtil: OtpUtil,
    private readonly hashUtil: HashUtil,
    private readonly credentialUtil: CredentialUtil,
    private readonly slugUtil: SlugUtil,
    private readonly jwtUtil: JwtUtil,
    private readonly sessionUtil: SessionUtil,
  ) {}
  async register(payload: RegisterPayloadDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const contactConditions: Prisma.CredentialWhereInput = {
          value: payload.email || payload.phone,
          isVerified: true,
          verifiedAt: { not: null },
          deletedAt: null,
        };

        const existingUser = await tx.credential.findFirst({
          where: contactConditions,
        });

        if (existingUser) {
          throw new ConflictException('Credentials already in use');
        }

        await this.credentialUtil.cleanupUnverifiedCredentials(
          tx,
          payload.email,
          'EMAIL',
        );
        await this.credentialUtil.cleanupUnverifiedCredentials(
          tx,
          payload.phone,
          'PHONE',
        );

        const id = uuid.v7();

        const hash = await this.hashUtil.hash(payload.password);

        const user = await tx.user.create({
          data: {
            id: id,
            name: payload.name,
            password: hash,
            role: payload.role as Role,
          },
        });

        if (payload.email) {
          await this.credentialUtil.createCredential(
            tx,
            user.id,
            payload.email,
            'EMAIL',
          );
        }
        if (payload.phone) {
          await this.credentialUtil.createCredential(
            tx,
            user.id,
            payload.phone,
            'PHONE',
          );
        }

        return {
          message: `Verification code sent to ${
            payload.email && payload.phone
              ? `${payload.email} and ${payload.phone}`
              : payload.email
                ? payload.email
                : payload.phone
                  ? payload.phone
                  : 'unknown contact'
          }`,
        };
      });
    } catch (error) {
      this.errorUtil.handleError(error);
    }
  }

  async verifyOtp(payload: VerifyOtpPayloadDto) {
    try {
      const credential = await this.otpUtil.verifyOtp(
        payload.email || payload.phone,
        payload.otp,
      );

      if (credential === null) {
        throw new ForbiddenException('Invalid or expired OTP');
      }

      const slug = await this.slugUtil.createUserSlug(
        credential.user.name,
        credential.user.id,
      );

      const user = await this.prisma.user.update({
        where: { id: credential.user.id },
        data: {
          slug: slug,
          credentials: {
            update: {
              where: { id: credential.id },
              data: {
                isVerified: true,
                verifiedAt: new Date(),
                otp: null,
                otpExpiresAt: null,
              },
            },
          },
        },
        include: {
          credentials: {
            where: {
              id: credential.id,
              deletedAt: null,
            },
          },
        },
      });

      const { accessToken, refreshToken, sessionId } =
        await this.sessionUtil.createSession(
          user.id,
          user.slug,
          user.role,
          payload.userAgent,
          payload.ipAddress,
        );

      return {
        message: 'Validation successful',
        userId: user.id,
        userSlug: user.slug,
        role: user.role,
        accessToken,
        refreshToken,
        sessionId,
      };
    } catch (error) {
      this.errorUtil.handleError(error);
    }
  }

  async login(payload: LoginPayloadDto) {
    try {
      const value = payload.email || payload.phone;
      const existingUser = await this.prisma.user.findFirst({
        where: {
          credentials: {
            some: {
              value,
              isVerified: true,
              verifiedAt: { not: null },
              deletedAt: null,
            },
          },
        },
        include: {
          credentials: {
            where: {
              value,
              isVerified: true,
              verifiedAt: { not: null },
              deletedAt: null,
            },
          },
        },
      });

      if (
        !existingUser ||
        !(await this.hashUtil.compare(payload.password, existingUser.password))
      ) {
        throw new ForbiddenException('Invalid credentials');
      }

      const { accessToken, refreshToken, sessionId } =
        await this.sessionUtil.createSession(
          existingUser.id,
          existingUser.slug,
          existingUser.role,
          payload.userAgent,
          payload.ipAddress,
        );

      return {
        message: 'Login successful',
        userId: existingUser.id,
        userSlug: existingUser.slug,
        role: existingUser.role,
        accessToken,
        refreshToken,
        sessionId,
      };
    } catch (error) {
      this.errorUtil.handleError(error);
    }
  }

  async addCredential(payload: AddCredentialPayloadDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const contactConditions: Prisma.CredentialWhereInput = {
          value: payload.email || payload.phone,
          isVerified: true,
          verifiedAt: { not: null },
          deletedAt: null,
        };

        const existingUser = await tx.credential.findFirst({
          where: contactConditions,
        });

        if (existingUser) {
          throw new ConflictException('Credentials already in use');
        }

        await this.credentialUtil.cleanupUnverifiedCredentials(
          tx,
          payload.email,
          'EMAIL',
        );
        await this.credentialUtil.cleanupUnverifiedCredentials(
          tx,
          payload.phone,
          'PHONE',
        );

        if (payload.email) {
          await this.credentialUtil.createCredential(
            tx,
            payload.id,
            payload.email,
            'EMAIL',
          );
        }
        if (payload.phone) {
          await this.credentialUtil.createCredential(
            tx,
            payload.id,
            payload.phone,
            'PHONE',
          );
        }

        return {
          message: `Verification code sent to ${
            payload.email && payload.phone
              ? `${payload.email} and ${payload.phone}`
              : payload.email
                ? payload.email
                : payload.phone
                  ? payload.phone
                  : 'unknown contact'
          }`,
        };
      });
    } catch (error) {
      this.errorUtil.handleError(error);
    }
  }

  async validateAccessToken(payload: ValidateAccessTokenPayloadDto) {
    try {
      let token = payload.token;

      token = token.replace('Bearer ', '');

      return await this.sessionUtil.validateAccessToken(token);
    } catch (error) {
      this.errorUtil.handleError(error);
    }
  }

  async refreshAccessToken(payload: RefreshAccessTokenPayloadDto) {
    try {
      const { sessionId, token, userId } = payload;
      if (!token && !sessionId) {
        throw new UnauthorizedException('Provide refresh token and sessionId');
      }

      const {
        accessToken,
        refreshToken,
        sessionId: id,
      } = await this.sessionUtil.refreshAccessToken(sessionId, token, userId);

      return {
        message: 'Refresh token successful',
        accessToken,
        refreshToken,
        sessionId: id,
        test: 'test',
      };
    } catch (error) {
      this.errorUtil.handleError(error);
    }
  }

  async logout(payload: LogoutPayloadDto) {
    try {
      const { sessionId, userId } = payload;
      return await this.sessionUtil.revokeSession(sessionId, userId);
    } catch (error) {
      this.errorUtil.handleError(error);
    }
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ErrorUtil } from '../utils';
import {
  AddCredentialPayloadDto,
  AddCredentialBodyDto,
  LoginPayloadDto,
  LoginBodyDto,
  LogoutPayloadDto,
  LogoutBodyDto,
  RefreshAccessTokenPayloadDto,
  RefreshAccessTokenBodyDto,
  RegisterPayloadDto,
  RegisterBodyDto,
  VerifyOtpPayloadDto,
  VerifyOtpBodyDto,
} from '@app/dtos';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { Request, Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authClient: ClientProxy,
    private readonly errorUtil: ErrorUtil,
  ) {}

  async register(body: RegisterBodyDto) {
    try {
      return await firstValueFrom(
        this.authClient
          .send({ cmd: 'auth_register' }, body as RegisterPayloadDto)
          .pipe(
            catchError((error) => {
              return throwError(() => error);
            }),
          ),
      );
    } catch (error) {
      throw this.errorUtil.handleError(error);
    }
  }

  async verifyOtp(
    body: VerifyOtpBodyDto,
    userAgent?: string,
    ipAddress?: string,
  ) {
    try {
      return await firstValueFrom(
        this.authClient
          .send({ cmd: 'auth_verify_otp' }, {
            ...body,
            userAgent,
            ipAddress,
          } as VerifyOtpPayloadDto)
          .pipe(
            catchError((error) => {
              return throwError(() => error);
            }),
          ),
      );
    } catch (error) {
      throw this.errorUtil.handleError(error);
    }
  }

  async login(body: LoginBodyDto, userAgent?: string, ipAddress?: string) {
    try {
      return await firstValueFrom(
        this.authClient
          .send({ cmd: 'auth_login' }, {
            ...body,
            userAgent,
            ipAddress,
          } as LoginPayloadDto)
          .pipe(
            catchError((error) => {
              return throwError(() => error);
            }),
          ),
      );
    } catch (error) {
      throw this.errorUtil.handleError(error);
    }
  }

  async addCredential(body: AddCredentialBodyDto, user) {
    try {
      return await firstValueFrom(
        this.authClient
          .send({ cmd: 'auth_add_credential' }, {
            ...body,
            ...user,
          } as AddCredentialPayloadDto)
          .pipe(
            catchError((error) => {
              return throwError(() => error);
            }),
          ),
      );
    } catch (error) {
      throw this.errorUtil.handleError(error);
    }
  }

  async refreshAccessToken(
    token: string,
    sessionId: string,
    body: RefreshAccessTokenBodyDto,
  ) {
    try {
      return await firstValueFrom(
        this.authClient
          .send({ cmd: 'auth_refresh_access_token' }, {
            token,
            sessionId,
            ...body,
          } as RefreshAccessTokenPayloadDto)
          .pipe(
            catchError((error) => {
              console.error(error);
              return throwError(() => error);
            }),
          ),
      );
    } catch (error) {
      throw this.errorUtil.handleError(error);
    }
  }

  async logout(body: LogoutBodyDto) {
    try {
      return await firstValueFrom(
        this.authClient
          .send({ cmd: 'auth_logout' }, body as LogoutPayloadDto)
          .pipe(
            catchError((error) => {
              return throwError(() => error);
            }),
          ),
      );
    } catch (error) {
      throw this.errorUtil.handleError(error);
    }
  }

  async handleAuthResponse(
    req: Request,
    res: Response,
    accessToken: string,
    refreshToken: string,
    sessionId: string,
    response: Record<string, any>,
  ) {
    try {
      if (req.get('X-Auth-Method') === 'token') {
        return {
          accessToken,
          refreshToken,
          ...response,
        };
      }

      // ✅ Native way to set cookies in NestJS
      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: true, // Only for HTTPS
        sameSite: 'strict', // CSRF protection
      });
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });
      res.cookie('session_id', sessionId, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });

      // ✅ NestJS still sends a JSON response
      return { ...response };
    } catch (error) {
      throw this.errorUtil.handleError(error);
    }
  }
}

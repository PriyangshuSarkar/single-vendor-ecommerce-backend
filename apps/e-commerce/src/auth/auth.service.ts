import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ErrorUtil } from '../utils';
import {
  AddCredentialPayloadDto,
  AddCredentialRequestBodyDto,
  LoginPayloadDto,
  LoginRequestBodyDto,
  LogoutPayloadDto,
  LogoutRequestBodyDto,
  RefreshAccessTokenPayloadDto,
  RefreshAccessTokenRequestBodyDto,
  RegisterPayloadDto,
  RegisterRequestBodyDto,
  ValidateAccessTokenResponseDto,
  VerifyOtpPayloadDto,
  VerifyOtpRequestBodyDto,
} from '@app/dtos';
import { catchError, firstValueFrom, throwError } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authClient: ClientProxy,
    private readonly errorUtil: ErrorUtil,
  ) {}

  async register(body: RegisterRequestBodyDto) {
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
    body: VerifyOtpRequestBodyDto,
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

  async login(
    body: LoginRequestBodyDto,
    userAgent?: string,
    ipAddress?: string,
  ) {
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

  async addCredential(
    body: AddCredentialRequestBodyDto,
    user: ValidateAccessTokenResponseDto,
  ) {
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
    body: RefreshAccessTokenRequestBodyDto,
  ) {
    try {
      return await firstValueFrom(
        this.authClient
          .send({ cmd: 'auth_refresh_access_token' }, {
            token,
            ...body,
          } as RefreshAccessTokenPayloadDto)
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

  async logout(body: LogoutRequestBodyDto) {
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
}

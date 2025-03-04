import { Controller, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

import {
  AddCredentialPayloadDto,
  AddCredentialResponseDto,
  LoginPayloadDto,
  LoginResponseDto,
  LogoutPayloadDto,
  LogoutResponseDto,
  RefreshAccessTokenPayloadDto,
  RefreshAccessTokenResponseDto,
  RegisterPayloadDto,
  RegisterResponseDto,
  ValidateAccessTokenPayloadDto,
  ValidateAccessTokenResponseDto,
  VerifyOtpPayloadDto,
  VerifyOtpResponseDto,
} from '@app/dtos';
import { TransformInterceptor } from '@app/interceptors/transform.interceptor';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'auth_register' })
  @UseInterceptors(new TransformInterceptor(RegisterResponseDto))
  async register(@Payload() payload: RegisterPayloadDto) {
    return await this.authService.register(payload);
  }

  @MessagePattern({ cmd: 'auth_verify_otp' })
  @UseInterceptors(new TransformInterceptor(VerifyOtpResponseDto))
  async verifyOtp(@Payload() payload: VerifyOtpPayloadDto) {
    return await this.authService.verifyOtp(payload);
  }

  @MessagePattern({ cmd: 'auth_login' })
  @UseInterceptors(new TransformInterceptor(LoginResponseDto))
  async login(@Payload() payload: LoginPayloadDto) {
    return await this.authService.login(payload);
  }

  @MessagePattern({ cmd: 'auth_add_credential' })
  @UseInterceptors(new TransformInterceptor(AddCredentialResponseDto))
  async addCredential(
    @Payload()
    payload: AddCredentialPayloadDto,
  ) {
    console.debug(payload);
    return await this.authService.addCredential(payload);
  }

  @MessagePattern({ cmd: 'auth_validate_access_token' })
  @UseInterceptors(new TransformInterceptor(ValidateAccessTokenResponseDto))
  async validateAccessToken(@Payload() payload: ValidateAccessTokenPayloadDto) {
    const test = await this.authService.validateAccessToken(payload);
    return test;
  }

  @MessagePattern({ cmd: 'auth_refresh_access_token' })
  @UseInterceptors(new TransformInterceptor(RefreshAccessTokenResponseDto))
  async refreshAccessToken(
    @Payload()
    payload: RefreshAccessTokenPayloadDto,
  ) {
    return await this.authService.refreshAccessToken(payload);
  }

  @MessagePattern({ cmd: 'auth_logout' })
  @UseInterceptors(new TransformInterceptor(LogoutResponseDto))
  async logout(
    @Payload()
    payload: LogoutPayloadDto,
  ) {
    return await this.authService.logout(payload);
  }
}

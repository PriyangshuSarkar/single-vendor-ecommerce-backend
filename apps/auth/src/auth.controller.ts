import { Controller, UseInterceptors, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ZodBodyValidationPipe } from '@app/pipes/zod';
import { ZodResponseInterceptor } from '@app/interceptors/zod';
import {
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

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'auth_register' })
  @UsePipes(new ZodBodyValidationPipe(RegisterPayloadDto))
  @UseInterceptors(new ZodResponseInterceptor(RegisterResponseDto))
  async register(@Payload() payload: RegisterPayloadDto) {
    return await this.authService.register(payload);
  }

  @MessagePattern({ cmd: 'auth_verify_otp' })
  @UsePipes(new ZodBodyValidationPipe(VerifyOtpPayloadDto))
  @UseInterceptors(new ZodResponseInterceptor(VerifyOtpResponseDto))
  async verifyOtp(@Payload() payload: VerifyOtpPayloadDto) {
    return await this.authService.verifyOtp(payload);
  }

  @MessagePattern({ cmd: 'auth_login' })
  @UsePipes(new ZodBodyValidationPipe(LoginPayloadDto))
  @UseInterceptors(new ZodResponseInterceptor(LoginResponseDto))
  async login(@Payload() payload: LoginPayloadDto) {
    return await this.authService.login(payload);
  }

  @MessagePattern({ cmd: 'auth_validate_access_token' })
  @UsePipes(new ZodBodyValidationPipe(ValidateAccessTokenPayloadDto))
  @UseInterceptors(new ZodResponseInterceptor(ValidateAccessTokenResponseDto))
  async validateAccessToken(@Payload() payload: ValidateAccessTokenPayloadDto) {
    return await this.authService.validateAccessToken(payload);
  }

  @MessagePattern({ cmd: 'auth_refresh_access_token' })
  @UsePipes(new ZodBodyValidationPipe(RefreshAccessTokenPayloadDto))
  @UseInterceptors(new ZodResponseInterceptor(RefreshAccessTokenResponseDto))
  async refreshAccessToken(
    @Payload()
    payload: RefreshAccessTokenPayloadDto,
  ) {
    return await this.authService.refreshAccessToken(payload);
  }

  @MessagePattern({ cmd: 'auth_refresh_access_token' })
  @UsePipes(new ZodBodyValidationPipe(LogoutPayloadDto))
  @UseInterceptors(new ZodResponseInterceptor(LogoutResponseDto))
  async logout(
    @Payload()
    payload: LogoutPayloadDto,
  ) {
    return await this.authService.logout(payload);
  }
}

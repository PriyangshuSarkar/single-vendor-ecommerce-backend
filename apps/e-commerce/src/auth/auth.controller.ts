import {
  AddCredentialBodyDto,
  AddCredentialResponseDto,
  LoginBodyDto,
  LoginResponseDto,
  LogoutBodyDto,
  LogoutResponseDto,
  RefreshAccessTokenBodyDto,
  RefreshAccessTokenResponseDto,
  RegisterBodyDto,
  RegisterResponseDto,
  VerifyOtpBodyDto,
  VerifyOtpResponseDto,
} from '@app/dtos';
import {
  Body,
  Controller,
  Delete,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';

import { Auth } from './auth.decorator';
import { AuthGuard } from './auth.guard';
import { TransformInterceptor } from '@app/interceptors/transform.interceptor';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @UseInterceptors(new TransformInterceptor(RegisterResponseDto))
  async register(@Body() body: RegisterBodyDto) {
    return await this.authService.register(body);
  }

  @Post('/verify-otp')
  @UseInterceptors(new TransformInterceptor(VerifyOtpResponseDto))
  async verifyOtp(
    @Req() req: Request,
    @Body() body: VerifyOtpBodyDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.headers['user-agent'] || undefined;
    const ipAddress =
      (req.headers['x-forwarded-for'] as string) ||
      req.socket.remoteAddress ||
      undefined;

    const { accessToken, refreshToken, ...response } =
      await this.authService.verifyOtp(body, userAgent, ipAddress);

    return this.authService.handleAuthResponse(
      req,
      res,
      accessToken,
      refreshToken,
      response,
    );
  }

  @Post('/login')
  @UseInterceptors(new TransformInterceptor(LoginResponseDto))
  async login(
    @Req() req: Request,
    @Body() body: LoginBodyDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.headers['user-agent'] || undefined;
    const ipAddress =
      (req.headers['x-forwarded-for'] as string) ||
      req.socket.remoteAddress ||
      undefined;

    const { accessToken, refreshToken, ...response } =
      await this.authService.login(body, userAgent, ipAddress);

    return this.authService.handleAuthResponse(
      req,
      res,
      accessToken,
      refreshToken,
      response,
    );
  }

  @Post('/add-credential')
  @UseGuards(AuthGuard)
  @UseInterceptors(new TransformInterceptor(AddCredentialResponseDto))
  async addCredential(
    @Body() body: AddCredentialBodyDto, // This should only contain phone
    @Auth() user, // This gets the JWT data from req.user
  ) {
    return await this.authService.addCredential(body, user);
  }

  @Patch('/refresh_access_token')
  @UseInterceptors(new TransformInterceptor(RefreshAccessTokenResponseDto))
  async refreshAccessToken(
    @Req() req: Request,
    @Body() body: RefreshAccessTokenBodyDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token =
      (req.headers['x-refresh-token'] as string) || req.cookies?.refresh_token;

    if (!token) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const { accessToken, refreshToken, ...response } =
      await this.authService.refreshAccessToken(token, body);

    return this.authService.handleAuthResponse(
      req,
      res,
      accessToken,
      refreshToken,
      response,
    );
  }

  @Delete('/logout')
  @UseInterceptors(new TransformInterceptor(LogoutResponseDto))
  async logout(@Body() body: LogoutBodyDto) {
    return await this.authService.logout(body);
  }
}

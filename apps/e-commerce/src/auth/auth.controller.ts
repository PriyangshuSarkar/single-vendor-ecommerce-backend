import {
  AddCredentialRequestBodyDto,
  AddCredentialResponseDto,
  LoginRequestBodyDto,
  LoginResponseDto,
  LogoutRequestBodyDto,
  LogoutResponseDto,
  RefreshAccessTokenRequestBodyDto,
  RefreshAccessTokenResponseDto,
  RegisterRequestBodyDto,
  RegisterResponseDto,
  ValidateAccessTokenResponseDto,
  VerifyOtpRequestBodyDto,
  VerifyOtpResponseDto,
} from '@app/dtos';
import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { ZodBodyValidationPipe } from '@app/pipes/zod';
import { ZodResponseInterceptor } from '@app/interceptors/zod';

import { Auth } from './auth.decorator';
import { AuthGuard } from './auth.guard';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @UsePipes(new ZodBodyValidationPipe(RegisterRequestBodyDto))
  @UseInterceptors(new ZodResponseInterceptor(RegisterResponseDto))
  async register(@Body() body: RegisterRequestBodyDto) {
    return await this.authService.register(body);
  }

  @Post('/verify-otp')
  @UsePipes(new ZodBodyValidationPipe(VerifyOtpRequestBodyDto))
  @UseInterceptors(new ZodResponseInterceptor(VerifyOtpResponseDto))
  async verifyOtp(
    @Req() req: Request,
    @Body() body: VerifyOtpRequestBodyDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.headers['user-agent'] || undefined;
    const ipAddress =
      (req.headers['x-forwarded-for'] as string) ||
      req.socket.remoteAddress ||
      undefined;

    const { accessToken, refreshToken, ...response } =
      await this.authService.verifyOtp(body, userAgent, ipAddress);

    if (req.get('X-Auth-Method') === 'token') {
      return {
        accessToken,
        refreshToken,
        ...response,
      };
    }

    // ✅ Native way to set cookies in NestJS
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true, // Only for HTTPS
      sameSite: 'strict', // CSRF protection
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    // ✅ NestJS still sends a JSON response
    return {
      ...response,
    };
  }

  @Post('/login')
  @UsePipes(new ZodBodyValidationPipe(LoginRequestBodyDto))
  @UseInterceptors(new ZodResponseInterceptor(LoginResponseDto))
  async login(
    @Req() req: Request,
    @Body() body: LoginRequestBodyDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.headers['user-agent'] || undefined;
    const ipAddress =
      (req.headers['x-forwarded-for'] as string) ||
      req.socket.remoteAddress ||
      undefined;

    const { accessToken, refreshToken, ...response } =
      await this.authService.login(body, userAgent, ipAddress);

    if (req.get('X-Auth-Method') === 'token') {
      return {
        accessToken,
        refreshToken,
        ...response,
      };
    }

    // ✅ Native way to set cookies in NestJS
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true, // Only for HTTPS
      sameSite: 'strict', // CSRF protection
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    // ✅ NestJS still sends a JSON response
    return {
      ...response,
    };
  }

  @Post('/add-credential')
  @UseGuards(AuthGuard)
  @UsePipes(new ZodBodyValidationPipe(AddCredentialRequestBodyDto))
  @UseInterceptors(new ZodResponseInterceptor(AddCredentialResponseDto))
  async addCredential(
    @Body() body: AddCredentialRequestBodyDto, // This should only contain phone
    @Auth() user: ValidateAccessTokenResponseDto, // This gets the JWT data from req.user
  ) {
    return await this.authService.addCredential(body, user);
  }

  @Post('/refresh_access_token')
  @UsePipes(new ZodBodyValidationPipe(RefreshAccessTokenRequestBodyDto))
  @UseInterceptors(new ZodResponseInterceptor(RefreshAccessTokenResponseDto))
  async refreshAccessToken(
    @Req() req: Request,
    @Body() body: RefreshAccessTokenRequestBodyDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken =
      (req.headers['x-refresh-token'] as string) || req.cookies?.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const { accessToken, ...response } =
      await this.authService.refreshAccessToken(refreshToken, body);

    if (req.get('X-Auth-Method') === 'token') {
      return {
        accessToken,
        refreshToken,
        ...response,
      };
    }

    // ✅ Native way to set cookies in NestJS
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true, // Only for HTTPS
      sameSite: 'strict', // CSRF protection
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    // ✅ NestJS still sends a JSON response
    return {
      ...response,
    };
  }

  @Post('/logout')
  @UsePipes(new ZodBodyValidationPipe(LogoutRequestBodyDto))
  @UseInterceptors(new ZodResponseInterceptor(LogoutResponseDto))
  async logout(@Body() body: LogoutRequestBodyDto) {
    return await this.authService.logout(body);
  }
}

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { ErrorUtil } from '../utils';
import { ValidateAccessTokenPayloadDto } from '@app/dtos';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly JWT_SECRET: string;
  private readonly JWT_EXPIRATION_TIME: string;
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authClient: ClientProxy,
    private readonly errorUtil: ErrorUtil,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.JWT_SECRET = this.configService.get<string>(
      'JWT_SECRET',
      'defaultSecret',
    ); // Added fallback
    this.JWT_EXPIRATION_TIME = this.configService.get<string>(
      'JWT_EXPIRATION_TIME',
      '1h',
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const req = this.getRequest(context);

      const token = this.extractToken(req);

      if (!token) {
        req.user = null; // ✅ No token? Allow request but user is "guest"
        return true;
      }

      let decoded: any = undefined;

      try {
        // ✅ First attempt: Verify JWT locally
        decoded = await this.jwtService.verifyAsync(token, {
          secret: this.JWT_SECRET,
        });
      } catch {}

      if (!decoded) {
        // ❌ Local verification failed, calling Auth Microservice

        const response = await firstValueFrom(
          this.authClient
            .send({ cmd: 'auth_validate_access_token' }, {
              token,
            } as ValidateAccessTokenPayloadDto)
            .pipe(
              catchError((error) =>
                throwError(() => this.errorUtil.handleError(error)),
              ),
            ),
        );

        req.user = response; // Attach validated user to request
      } else {
        req.user = decoded; // Attach validated user to data
      }
      return true;
    } catch (error) {
      throw this.errorUtil.handleError(error);
    }
  }

  private getRequest(context: ExecutionContext): any {
    return context.switchToHttp().getRequest(); // ✅ Works for HTTP requests
  }

  private extractToken(req: any): string | undefined {
    if (req?.cookies?.access_token) {
      return req.cookies.access_token;
    }
    if (req?.headers?.authorization?.startsWith('Bearer ')) {
      const authHeader = req?.headers?.authorization;
      return authHeader?.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : null;
    }
    return undefined;
  }
}

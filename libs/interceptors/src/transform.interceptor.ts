import { Logger } from '@app/logger';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Observable, map } from 'rxjs';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, any> {
  constructor(
    private readonly target: any,
    private readonly excludeExtraneousValues: boolean = true,
    private readonly debug: boolean = process.env.DEBUG === 'true',
  ) {}
  private logger = new Logger();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        let result: any | undefined = undefined;
        try {
          result = plainToInstance(this.target, data, {
            excludeExtraneousValues: this.excludeExtraneousValues,
          });

          return result;
        } catch (error) {
          if (this.debug) {
            this.logger.log(
              'Original Response:',
              JSON.stringify(data, null, 2),
            );

            this.logger.log(
              'Filtered Response (After Interceptor):',
              JSON.stringify(result, null, 2),
            );
          }
          if (error instanceof InternalServerErrorException) {
            throw error;
          }
          throw new InternalServerErrorException('Response validation failed');
        }
      }),
    );
  }
}

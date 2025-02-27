import { Logger } from '@app/logger';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  InternalServerErrorException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs';
import { ZodSchema, ZodError } from 'zod';

@Injectable()
export class ZodResponseInterceptor<T> implements NestInterceptor<unknown, T> {
  constructor(
    private schema: ZodSchema<T>,
    private debug: boolean = process.env.DEBUG === 'true',
  ) {}

  private logger = new Logger();

  intercept(context: ExecutionContext, next: CallHandler): Observable<T> {
    return next.handle().pipe(
      map((data) => {
        try {
          // Use safeParse instead of parse for better error handling
          const result = this.schema.safeParse(data);

          if (!result.success) {
            if (this.debug) {
              this.logger.error(
                result.error.issues.map((issue) => issue.message).join(', '),
                JSON.stringify(result.error, null, 2),
                result.error.name,
              );
            }
            throw new InternalServerErrorException({
              message: 'Invalid response format',
              errors: this.formatErrors(result.error),
            });
          }

          return result.data;
        } catch (error) {
          if (error instanceof InternalServerErrorException) {
            throw error;
          }
          throw new InternalServerErrorException('Response validation failed');
        }
      }),
    );
  }

  private formatErrors(error: ZodError): Record<string, string[]> {
    return error.errors.reduce(
      (acc, curr) => {
        const key = curr.path.join('.') || 'root';
        acc[key] = acc[key] || [];
        acc[key].push(curr.message);
        return acc;
      },
      {} as Record<string, string[]>,
    );
  }
}

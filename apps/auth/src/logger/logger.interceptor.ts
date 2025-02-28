import { Logger } from '@app/logger';
import { Injectable, NestInterceptor } from '@nestjs/common';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
// Import the shared Logger service
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: Logger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const data = context.switchToRpc().getData(); // Get the incoming message from the RPC context
    const pattern = context.switchToRpc().getContext().args[1];

    // Log incoming message
    this.logger.log(
      `${pattern} | Data: ${JSON.stringify(data)}`,
      'TCPRequestLogger',
    );

    return next.handle().pipe(
      tap((response) => {
        const duration = Date.now() - start;
        this.logger.log(
          `${JSON.stringify(response)} | Duration: \x1b[33m+${duration}ms\x1b[0m`,
          'TCPResponseLogger',
        );
      }),
    );
  }
}

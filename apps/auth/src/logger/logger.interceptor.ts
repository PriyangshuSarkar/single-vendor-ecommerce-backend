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
    const data = context.switchToRpc().getData(); // Get the incoming message from the RPC context
    const pattern = context.getArgs()[0].pattern; // Get the message pattern (e.g., 'auth.login')

    // Log incoming message
    this.logger.log(
      `Received message for pattern: ${pattern} with data: ${JSON.stringify(data)}`,
      'MicroserviceLogger',
    );

    return next.handle().pipe(
      tap((result) => {
        // Log the response after processing
        this.logger.log(
          `Processed response for pattern: ${pattern} with result: ${JSON.stringify(result)}`,
          'MicroserviceLogger',
        );
      }),
    );
  }
}

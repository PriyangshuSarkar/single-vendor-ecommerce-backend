// import { Logger } from '@app/logger';
import { Logger } from '@app/logger';
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

import { ZodSchema, ZodError } from 'zod';

@Injectable()
export class ZodBodyValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(
    private schema: ZodSchema<T>,
    private debug: boolean = process.env.DEBUG === 'true',
  ) {}

  private logger = new Logger();

  transform(value: unknown, metadata: ArgumentMetadata): T {
    // const logger = new Logger();
    // logger.warn('value', JSON.stringify(value));
    // logger.warn('metadata', JSON.stringify(metadata));

    // Return early if value is undefined or null and we're not validating body
    if ((value === undefined || value === null) && metadata.type !== 'body') {
      return value as T;
    }

    // Only validate if we're transforming the request body
    if (metadata.type === 'body') {
      try {
        const result = this.schema.safeParse(value);

        if (!result.success) {
          console.log(JSON.stringify(result.error, null, 2));
          if (this.debug) {
            this.logger.error(
              result.error.issues.map((issue) => issue.message).join(', '),
              JSON.stringify(result.error, null, 2),
              result.error.name,
            );
          }
          throw new BadRequestException({
            message: 'Validation failed',
            errors: this.formatErrors(result.error),
          });
        }

        return result.data;
      } catch (error) {
        if (error instanceof BadRequestException) {
          throw error;
        }
        throw new BadRequestException('Request validation failed');
      }
    }

    // For non-body data, just pass it through
    return value as T;
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

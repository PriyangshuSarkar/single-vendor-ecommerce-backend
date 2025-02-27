import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { Logger } from 'winston';
import { ZodSchema, ZodError } from 'zod';

@Injectable()
export class ZodQueryValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(
    private schema: ZodSchema<T>,
    private debug: boolean = process.env.DEBUG === 'true',
  ) {}

  private logger = new Logger();

  transform(value: unknown, metadata: ArgumentMetadata): T {
    if (metadata.type !== 'query') {
      return value as T;
    }

    try {
      // Ensure query parameters are properly cast to expected types
      const parsedQuery = this.convertQueryParams(value);

      const result = this.schema.safeParse(parsedQuery);

      if (!result.success) {
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

  private convertQueryParams(query: unknown): unknown {
    if (typeof query !== 'object' || query === null) return query;

    const convertedQuery: Record<string, unknown> = { ...query };

    for (const key in convertedQuery) {
      if (Array.isArray(convertedQuery[key])) {
        // Handle array parameters
        convertedQuery[key] = (convertedQuery[key] as string[]).map((item) =>
          this.autoCast(item),
        );
      } else {
        convertedQuery[key] = this.autoCast(convertedQuery[key] as string);
      }
    }

    return convertedQuery;
  }

  private autoCast(value: string): unknown {
    if (!isNaN(Number(value))) return Number(value);
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
    return value;
  }
}

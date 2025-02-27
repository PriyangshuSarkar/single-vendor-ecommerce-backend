import { Logger } from '@app/logger';
import { Injectable } from '@nestjs/common';
import * as Exception from '@nestjs/common/exceptions';
import { RpcException } from '@nestjs/microservices';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class ErrorUtil {
  private debug: boolean = process.env.DEBUG === 'true';
  private logger = new Logger();

  private static readonly httpExceptions: Record<number, any> = (() => {
    return Object.keys(Exception)
      .filter((key) => key.endsWith('Exception'))
      .reduce(
        (acc, key) => {
          const exception = (Exception as any)[key];
          if (exception && exception.prototype?.getStatus) {
            acc[new exception().getStatus()] = exception;
          }
          return acc;
        },
        {} as Record<number, any>,
      );
  })();

  private static readonly prismaErrorMap: Record<
    string,
    { status: number; message: string }
  > = {
    P2002: { status: 409, message: 'Unique constraint failed' },
    P2003: { status: 400, message: 'Foreign key constraint failed' },
    P2025: { status: 404, message: 'Record not found' },
    P2014: { status: 400, message: 'Relation violation' },
    P2015: { status: 400, message: 'Related record not found' },
    // Add more error codes if needed
  };

  handleError(error: any) {
    if (this.debug) {
      this.logger.error(
        error.message,
        JSON.stringify(error, null, 2),
        error.name,
      );
    }

    // Handle Prisma Errors using PrismaExceptions dynamically
    if (error instanceof PrismaClientKnownRequestError) {
      const mappedError = ErrorUtil.prismaErrorMap[error.code];
      if (mappedError) {
        throw new Exception.HttpException(
          mappedError.message,
          mappedError.status,
        );
      }
      // If Prisma error is unknown, return a generic database error
      throw new Exception.InternalServerErrorException(
        `Database error: ${error.message}`,
      );
    }

    // Handle Unexpected Errors
    if (!(error instanceof Error)) {
      throw new RpcException(
        new Exception.InternalServerErrorException(
          'An unexpected error occurred',
        ),
      );
    }

    // If the error is already a NestJS HTTP Exception, rethrow it
    if ('getStatus' in error && typeof error.getStatus === 'function') {
      throw new RpcException(error);
    }

    // Default Fallback
    throw new RpcException(
      new Exception.InternalServerErrorException(
        'An unexpected server error occurred',
      ),
    );
  }
}

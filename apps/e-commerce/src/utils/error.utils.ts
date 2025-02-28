import * as Exception from '@nestjs/common/exceptions';
import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Logger } from '@app/logger';

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

    // If the error is already a NestJS HTTP Exception, rethrow it
    if ('getStatus' in error && typeof error.getStatus === 'function') {
      throw error;
    }

    // Handle NestJS Microservice Errors (TCP responses)
    if (error?.response) {
      const { statusCode, message } = error.response;
      const ExceptionClass =
        ErrorUtil.httpExceptions[statusCode] ||
        Exception.InternalServerErrorException;
      throw new ExceptionClass(message || 'Unexpected error occurred');
    }

    // Handle RPC Exception from Microservice
    if (error instanceof RpcException) {
      const errorResponse = error.getError();
      throw new Exception.InternalServerErrorException(
        errorResponse || 'An unknown RPC error occurred',
      );
    }

    // Default Fallback
    throw new Exception.InternalServerErrorException(
      'An unexpected server error occurred',
    );
  }
}

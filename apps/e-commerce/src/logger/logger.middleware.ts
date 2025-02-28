import { Logger } from '@app/logger';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express'; // Import shared Logger service

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: Logger) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, body, query, params } = req;
    const start = Date.now();

    // Log incoming HTTP request
    this.logger.log(
      `${method} ${originalUrl} | Body: ${JSON.stringify(body)} | Params: ${JSON.stringify(params)} | Query: ${JSON.stringify(query)}`,
      'RequestLogger',
    );

    res.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = res;

      // Log the response after the request finishes
      this.logger.log(
        `${method} ${originalUrl} | Status: ${statusCode} | Duration \x1b[33m+${duration}ms\x1b[0m`,
        'ResponseLogger',
      );
    });

    next();
  }
}

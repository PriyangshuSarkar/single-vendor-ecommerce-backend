import { Injectable, LoggerService } from '@nestjs/common';
import stripAnsi from 'strip-ansi';
import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf, colorize } = format;

@Injectable()
export class Logger implements LoggerService {
  private logger = createLogger({
    level: 'info',
    format: combine(
      colorize({ all: true, level: true }),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      printf(({ timestamp, level, message, context, trace }) => {
        const traceOutput = trace
          ? `\n\x1b[33mStack Trace:\x1b[0m\n${trace}`
          : '';
        const fixedSpacing = 40;
        const timestampFormatted = this.formatTimestamp(
          timestamp as string,
        ).padEnd(fixedSpacing - level.length);
        return stripAnsi(level) !== 'info'
          ? `\n\n\x1b[0m\x1b[32m[Nest]\x1b[0m \x1b[32m${process.pid}\x1b[0m  \x1b[32m- \x1b[37m${timestampFormatted}\x1b[0m` +
              `\x1b[33m${level}\x1b[0m ${context ? `\x1b[33m[${context}]\x1b[0m ` : ''}${message}${traceOutput}\n\n`
          : `\x1b[0m\x1b[32m[Nest]\x1b[0m \x1b[32m${process.pid}\x1b[0m  \x1b[32m- \x1b[37m${timestampFormatted}\x1b[0m` +
              `\x1b[33m${level}\x1b[0m ${context ? `\x1b[33m[${context}]\x1b[0m ` : ''}${message}${traceOutput}`;
      }),
    ),
    transports: [new transports.Console()], // No need to specify a format here!
  });

  log(message: string, context?: string) {
    this.logger.info({ message, context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error({ message, trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn({ message, context });
  }

  debug(message: string, context?: string) {
    this.logger.debug({ message, context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose({ message, context });
  }

  private formatTimestamp(timestamp: string): string {
    return new Intl.DateTimeFormat('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(new Date(timestamp));
  }
}

import { Injectable, LoggerService } from '@nestjs/common';
import stripAnsi from 'strip-ansi';
import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf, colorize } = format;

@Injectable()
export class Logger implements LoggerService {
  private logger = createLogger({
    level: 'info', // Set default log level
    format: combine(
      colorize({ all: true, level: true }),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      printf(({ timestamp, level, message, context, trace }) => {
        // Add trace to the output if it exists
        const traceOutput = trace
          ? `\n\x1b[33mStack Trace:\x1b[0m\n${trace}`
          : '';
        return `\x1b[36m[${timestamp}]\x1b[0m \x1b[1m[\x1b[${this.getLogLevelColor(level)}m${level}\x1b[0m\x1b[1m]\x1b[0m ${
          context ? `\x1b[32m[${context}]\x1b[0m ` : ''
        }${message}${traceOutput}`;
      }),
    ),
    transports: [
      new transports.Console({
        format: combine(
          colorize({ all: true, level: true }),
          printf(
            ({
              level,
              message,
              context,
              timestamp,
              trace,
            }: {
              level: string;
              message: string;
              context: string;
              timestamp: string;
              trace: string;
            }) => {
              // Add trace to console output if it exists
              const traceOutput = trace
                ? `\n\x1b[33mStack Trace:\x1b[0m\n${trace}`
                : '';
              const logMessage = `\x1b[0m\x1b[1m[\x1b[${this.getLogLevelColor(level)}m${level.padEnd(7)}\x1b[0m\x1b[1m]\x1b[0m\x1b[0m \x1b[32m${process.pid}\x1b[0m  \x1b[32m- \x1b[37m${this.formatTimestamp(timestamp).padEnd(20)}\x1b[0m  ${
                context ? `\x1b[32m[${context.padEnd(15)}]\x1b[0m ` : ''
              }${message}${traceOutput}`;

              return stripAnsi(level) != 'info'
                ? `\n\n${logMessage}\n\n`
                : logMessage;
            },
          ),
        ),
      }),
      // Uncomment the following to add file logging
      // new transports.File({F
      //   filename: 'logs/app.log',
      //   format: combine(
      //     timestamp(),
      //     printf(({ timestamp, level, message, context, trace }) => {
      //       const traceOutput = trace ? `\nStack Trace:\n${trace}` : '';
      //       return `[${timestamp}] [${level}] ${context ? `[${context}]` : ''} ${message}${traceOutput}`;
      //     }),
      //   ),
      // }),
    ],
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

  private getLogLevelColor(level: string): string {
    switch (level) {
      case 'info':
        return '32'; // Green
      case 'error':
        return '31'; // Red
      case 'warn':
        return '33'; // Yellow
      case 'debug':
        return '34'; // Blue
      case 'verbose':
        return '35'; // Magenta
      default:
        return '37'; // White
    }
  }

  private formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(date);
  }
}

import { Injectable, LoggerService, Inject } from '@nestjs/common';

@Injectable()
export class NestlancerLoggerService implements LoggerService {
  constructor(@Inject('LOGGER_OPTIONS') private readonly options: { level?: string }) {}

  log(message: string, context?: string): void {
    console.log(
      JSON.stringify({ level: 'info', message, context, timestamp: new Date().toISOString() }),
    );
  }
  error(message: string, trace?: string, context?: string): void {
    console.error(
      JSON.stringify({
        level: 'error',
        message,
        trace,
        context,
        timestamp: new Date().toISOString(),
      }),
    );
  }
  warn(message: string, context?: string): void {
    console.warn(
      JSON.stringify({ level: 'warn', message, context, timestamp: new Date().toISOString() }),
    );
  }
  debug(message: string, context?: string): void {
    if (this.options.level === 'debug')
      console.debug(
        JSON.stringify({ level: 'debug', message, context, timestamp: new Date().toISOString() }),
      );
  }
  verbose(message: string, context?: string): void {
    console.log(
      JSON.stringify({ level: 'verbose', message, context, timestamp: new Date().toISOString() }),
    );
  }
}

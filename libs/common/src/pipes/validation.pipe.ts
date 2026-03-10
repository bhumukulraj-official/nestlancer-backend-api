import {
  ValidationPipe as NestValidationPipe,
  ValidationError,
  BadRequestException,
} from '@nestjs/common';
import { ERROR_CODES } from '../constants/error-codes.constants';

/**
 * Extended ValidationPipe with standard error format per 100-api-standards.
 */
export class AppValidationPipe extends NestValidationPipe {
  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors: ValidationError[]) => {
        const details = errors.map((error) => ({
          field: error.property,
          constraints: error.constraints || {},
        }));

        return new BadRequestException({
          status: 'error',
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Request validation failed',
            details,
            timestamp: new Date().toISOString(),
          },
        });
      },
    });
  }
}

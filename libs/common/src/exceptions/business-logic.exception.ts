import { HttpStatus } from '@nestjs/common';
import { BaseAppException } from './base.exception';
import { ERROR_CODES } from '../constants/error-codes.constants';

/** Thrown when a business rule is violated */
export class BusinessLogicException extends BaseAppException {
  constructor(
    message: string,
    code: string = ERROR_CODES.BUSINESS_LOGIC_ERROR,
    details?: Record<string, unknown>,
  ) {
    super(code, message, HttpStatus.UNPROCESSABLE_ENTITY, details ? [details] : undefined);
  }
}

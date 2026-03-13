import { HttpStatus } from '@nestjs/common';
import { BaseAppException } from './base.exception';
import { ERROR_CODES } from '../constants/error-codes.constants';

function mapBusinessCodeToStatus(code: string): HttpStatus {
  switch (code) {
    // Requests domain (see 104-requests-endpoints.md)
    case 'REQUEST_001':
      return HttpStatus.NOT_FOUND; // Request not found
    case 'REQUEST_002':
    case 'REQUEST_003':
    case 'REQUEST_004':
    case 'REQUEST_005':
    case 'REQUEST_012':
      return HttpStatus.BAD_REQUEST;
    case 'REQUEST_006':
      return HttpStatus.CONFLICT;
    case 'REQUEST_011':
      return HttpStatus.PAYLOAD_TOO_LARGE;

    // Explicitly documented as 422
    case 'REQUEST_007':
    case 'REQUEST_008':
    case 'REQUEST_009':
    case 'REQUEST_010':
      return HttpStatus.UNPROCESSABLE_ENTITY;

    default:
      return HttpStatus.UNPROCESSABLE_ENTITY;
  }
}

/** Thrown when a business rule is violated */
export class BusinessLogicException extends BaseAppException {
  constructor(
    message: string,
    code: string = ERROR_CODES.BUSINESS_LOGIC_ERROR,
    details?: Record<string, unknown>,
  ) {
    const status = code === ERROR_CODES.BUSINESS_LOGIC_ERROR ? HttpStatus.UNPROCESSABLE_ENTITY : mapBusinessCodeToStatus(code);
    super(code, message, status, details ? [details] : undefined);
  }
}

import { HttpStatus } from '@nestjs/common';
import { ValidationException } from '../../../../src/exceptions/validation.exception';
import { ERROR_CODES } from '../../../../src/constants/error-codes.constants';

describe('ValidationException', () => {
    it('should create an exception with BAD_REQUEST status and validation error code', () => {
        const exception = new ValidationException();

        expect(exception.message).toBe('Validation failed');
        expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        const response = exception.getResponse() as any;
        expect(response.code).toBe(ERROR_CODES.VALIDATION_ERROR);
        expect(response.message).toBe('Validation failed');
    });

    it('should include validation details if provided', () => {
        const details = [{ field: 'email', constraints: { isEmail: 'must be an email' } }];
        const exception = new ValidationException('Input invalid', details);

        const response = exception.getResponse() as any;
        expect(response.details).toEqual(details);
        expect(response.message).toBe('Input invalid');
    });
});

import { HttpStatus } from '@nestjs/common';
import { BusinessLogicException } from '../../../../src/exceptions/business-logic.exception';
import { ERROR_CODES } from '../../../../src/constants/error-codes.constants';

describe('BusinessLogicException', () => {
    it('should create an exception with UNPROCESSABLE_ENTITY status and default code', () => {
        const msg = 'Invalid workflow state';
        const exception = new BusinessLogicException(msg);

        expect(exception.message).toBe(msg);
        expect(exception.getStatus()).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
        const response = exception.getResponse() as any;
        expect(response.code).toBe(ERROR_CODES.BUSINESS_LOGIC_ERROR);
        expect(response.message).toBe(msg);
    });

    it('should allow overriding the error code', () => {
        const msg = 'Specific error';
        const exception = new BusinessLogicException(msg, 'SPECIFIC_ERR');

        const response = exception.getResponse() as any;
        expect(response.code).toBe('SPECIFIC_ERR');
    });
});

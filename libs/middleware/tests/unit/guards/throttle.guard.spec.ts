import { ExecutionContext, HttpException } from '@nestjs/common';
import { ThrottleGuard } from '../../../src/guards/throttle.guard';

describe('ThrottleGuard', () => {
    let guard: ThrottleGuard;

    beforeEach(() => {
        guard = new ThrottleGuard();
    });

    it('should allow first request', () => {
        const mockRequest = { ip: '127.0.0.1' };
        const mockContext = {
            switchToHttp: () => ({ getRequest: () => mockRequest }),
        } as unknown as ExecutionContext;

        expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('should allow consecutive requests below limit', () => {
        const mockRequest = { ip: '127.0.0.1' };
        const mockContext = {
            switchToHttp: () => ({ getRequest: () => mockRequest }),
        } as unknown as ExecutionContext;

        for (let i = 0; i < 99; i++) {
            expect(guard.canActivate(mockContext)).toBe(true);
        }
    });

    it('should throw exception when limit exceeded', () => {
        const mockRequest = { ip: '127.0.0.1' };
        const mockContext = {
            switchToHttp: () => ({ getRequest: () => mockRequest }),
        } as unknown as ExecutionContext;

        for (let i = 0; i < 100; i++) {
            guard.canActivate(mockContext);
        }

        expect(() => guard.canActivate(mockContext)).toThrow(HttpException);
    });
});

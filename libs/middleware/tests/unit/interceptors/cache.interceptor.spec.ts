import { ExecutionContext, CallHandler } from '@nestjs/common';
import { CacheInterceptor } from '../../../src/interceptors/cache.interceptor';
import { of } from 'rxjs';

describe('CacheInterceptor', () => {
  let interceptor: CacheInterceptor;

  beforeEach(() => {
    interceptor = new CacheInterceptor();
  });

  it('should bypass cache for non-GET requests', () => {
    const mockRequest = { method: 'POST' };
    const mockContext = {
      switchToHttp: () => ({ getRequest: () => mockRequest }),
    } as unknown as ExecutionContext;

    const mockCallHandler = {
      handle: jest.fn().mockReturnValue(of('handled')),
    } as CallHandler;

    interceptor.intercept(mockContext, mockCallHandler);
    expect(mockCallHandler.handle).toHaveBeenCalled();
  });

  it('should pass through GET requests', () => {
    const mockRequest = { method: 'GET' };
    const mockContext = {
      switchToHttp: () => ({ getRequest: () => mockRequest }),
    } as unknown as ExecutionContext;

    const mockCallHandler = {
      handle: jest.fn().mockReturnValue(of('handled')),
    } as CallHandler;

    interceptor.intercept(mockContext, mockCallHandler);
    expect(mockCallHandler.handle).toHaveBeenCalled();
  });
});

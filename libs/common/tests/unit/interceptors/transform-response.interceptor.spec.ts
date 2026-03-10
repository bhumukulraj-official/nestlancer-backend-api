import { TransformResponseInterceptor } from '../../../src/interceptors/transform-response.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('TransformResponseInterceptor', () => {
  let interceptor: TransformResponseInterceptor<any>;
  let context: ExecutionContext;
  let next: CallHandler;

  beforeEach(() => {
    interceptor = new TransformResponseInterceptor();
    context = {
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue({
        url: '/test',
        headers: {
          'x-correlation-id': 'uuid-123',
        },
      }),
      getResponse: jest.fn().mockReturnThis(),
    } as any;
    next = {
      handle: jest.fn().mockReturnValue(of({ foo: 'bar' })),
    };
  });

  it('should transform successful response into standard envelope', (done) => {
    interceptor.intercept(context, next).subscribe((result) => {
      expect(result.status).toBe('success');
      expect(result.data).toEqual({ foo: 'bar' });
      expect(result.metadata.requestId).toBe('uuid-123');
      expect(result.metadata.path).toBe('/test');
      done();
    });
  });

  it('should not wrap if already wrapped', (done) => {
    const wrappedData = { status: 'success', data: { biz: 'baz' } };
    next.handle = jest.fn().mockReturnValue(of(wrappedData));

    interceptor.intercept(context, next).subscribe((result) => {
      expect(result).toEqual(wrappedData);
      done();
    });
  });
});

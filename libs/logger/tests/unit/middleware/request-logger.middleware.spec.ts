import { Test, TestingModule } from '@nestjs/testing';
import { RequestLoggerMiddleware } from '../../../src/middleware/request-logger.middleware';
import { Logger } from '@nestjs/common';

describe('RequestLoggerMiddleware', () => {
  let middleware: RequestLoggerMiddleware;
  let loggerSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequestLoggerMiddleware],
    }).compile();

    middleware = module.get<RequestLoggerMiddleware>(RequestLoggerMiddleware);
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });

  afterEach(() => {
    loggerSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should skip logging for health checks', () => {
    const req = { path: '/api/v1/health' } as any;
    const res = {} as any;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(loggerSpy).not.toHaveBeenCalled();
  });

  it('should log request details on finish', () => {
    const req = {
      method: 'GET',
      originalUrl: '/api/v1/users',
      headers: { 'x-correlation-id': 'cor-123' },
    } as any;
    const res = {
      statusCode: 200,
      on: jest.fn((event, cb) => {
        if (event === 'finish') cb();
      }),
    } as any;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));
    expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('GET /api/v1/users 200'));
    expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('[cor-123]'));
  });
});

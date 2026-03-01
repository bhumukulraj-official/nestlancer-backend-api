import { AllExceptionsFilter } from '../../src/filters/all-exceptions.filter';
import { ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

describe('AllExceptionsFilter', () => {
    let filter: AllExceptionsFilter;
    let mockHttpAdapterHost: HttpAdapterHost;
    let mockArgumentsHost: ArgumentsHost;

    beforeEach(() => {
        mockHttpAdapterHost = {
            httpAdapter: {
                reply: jest.fn(),
                getRequestUrl: jest.fn().mockReturnValue('/test'),
                getRequestMethod: jest.fn().mockReturnValue('GET'),
            },
        } as any;

        mockArgumentsHost = {
            switchToHttp: () => ({
                getResponse: () => ({}),
                getRequest: () => ({
                    headers: {},
                    url: '/test',
                }),
            }),
        } as any;

        filter = new AllExceptionsFilter(mockHttpAdapterHost);
    });

    it('should be defined', () => {
        expect(filter).toBeDefined();
    });

    it('should catch HttpException and reply with formatted response', () => {
        const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

        filter.catch(exception, mockArgumentsHost);

        expect(mockHttpAdapterHost.httpAdapter.reply).toHaveBeenCalledWith(
            expect.any(Object),
            expect.objectContaining({
                status: 'error',
                error: expect.objectContaining({
                    code: 'BAD_REQUEST',
                    message: 'Test error',
                }),
            }),
            HttpStatus.BAD_REQUEST
        );
    });

    it('should catch unknown errors and reply with Internal Server Error', () => {
        const exception = new Error('Unknown crash');

        filter.catch(exception, mockArgumentsHost);

        expect(mockHttpAdapterHost.httpAdapter.reply).toHaveBeenCalledWith(
            expect.any(Object),
            expect.objectContaining({
                status: 'error',
                error: expect.objectContaining({
                    code: 'INTERNAL_SERVER_ERROR',
                }),
            }),
            HttpStatus.INTERNAL_SERVER_ERROR
        );
    });
});

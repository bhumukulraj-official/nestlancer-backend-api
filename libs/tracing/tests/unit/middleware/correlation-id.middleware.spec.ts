import { CorrelationIdMiddleware } from '../../../src/middleware/correlation-id.middleware';
import { Request, Response } from 'express';

describe('CorrelationIdMiddleware', () => {
    let middleware: CorrelationIdMiddleware;

    beforeEach(() => {
        middleware = new CorrelationIdMiddleware();
    });

    it('should use existing correlation id if provided', () => {
        const req = { headers: { 'x-correlation-id': 'existing-id' } } as unknown as Request;
        const res = { setHeader: jest.fn() } as unknown as Response;
        const next = jest.fn();

        middleware.use(req, res, next);

        expect(req.headers['x-correlation-id']).toBe('existing-id');
        expect(res.setHeader).toHaveBeenCalledWith('X-Correlation-ID', 'existing-id');
        expect(next).toHaveBeenCalled();
    });

    it('should generate new correlation id if none provided', () => {
        const req = { headers: {} } as unknown as Request;
        const res = { setHeader: jest.fn() } as unknown as Response;
        const next = jest.fn();

        middleware.use(req, res, next);

        const id = req.headers['x-correlation-id'];
        expect(id).toBeDefined();
        expect(typeof id).toBe('string');
        expect(res.setHeader).toHaveBeenCalledWith('X-Correlation-ID', id);
        expect(next).toHaveBeenCalled();
    });
});

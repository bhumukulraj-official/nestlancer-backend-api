import { WsAuthGuard } from '../../src/guards/ws-auth.guard';

import { WsException } from '@nestjs/websockets';

describe('WsAuthGuard', () => {
    let guard: WsAuthGuard;

    beforeEach(() => {
        guard = new WsAuthGuard();
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    it('should return true if token is provided in auth object', () => {
        const context = {
            switchToWs: () => ({
                getClient: () => ({
                    handshake: {
                        auth: { token: 'valid-token' },
                    },
                }),
            }),
        } as any;

        expect(guard.canActivate(context)).toBe(true);
    });

    it('should return true if token is provided in headers', () => {
        const context = {
            switchToWs: () => ({
                getClient: () => ({
                    handshake: {
                        headers: { authorization: 'Bearer valid-token' },
                    },
                }),
            }),
        } as any;

        expect(guard.canActivate(context)).toBe(true);
    });

    it('should throw WsException if token is missing', () => {
        const context = {
            switchToWs: () => ({
                getClient: () => ({
                    handshake: {},
                }),
            }),
        } as any;

        expect(() => guard.canActivate(context)).toThrow(WsException);
    });
});

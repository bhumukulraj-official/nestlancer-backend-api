import { Test, TestingModule } from '@nestjs/testing';
import { AuthPublicController } from '../../src/controllers/auth.public.controller';
import { AuthService } from '../../src/services/auth.service';
import { Response } from 'express';

describe('AuthPublicController', () => {
    let controller: AuthPublicController;
    let authService: AuthService;

    const mockResponse = () => {
        const res: Partial<Response> = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res as Response;
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthPublicController],
            providers: [
                {
                    provide: AuthService,
                    useValue: {
                        register: jest.fn(),
                        login: jest.fn(),
                        refresh: jest.fn(),
                        verify2FA: jest.fn(),
                        checkEmail: jest.fn(),
                        verifyEmail: jest.fn(),
                        resendVerification: jest.fn(),
                        forgotPassword: jest.fn(),
                        resetPassword: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<AuthPublicController>(AuthPublicController);
        authService = module.get<AuthService>(AuthService);
    });

    describe('register', () => {
        it('should return created user data and 201 status', async () => {
            const mockDto = { email: 'test@example.com', password: 'Password1!', firstName: 'Test', lastName: 'User', acceptTerms: true, turnstileToken: 'valid' };
            const expiresAt = new Date();
            jest.spyOn(authService, 'register').mockResolvedValue({
                user: { id: 'usr123', email: 'test@example.com', verificationTokens: [{ expiresAt }] },
                emailVerificationToken: 'token123'
            } as any);

            const res = mockResponse();
            const result = await controller.register(mockDto, '127.0.0.1', res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(result).toEqual({
                userId: 'usr123',
                email: 'test@example.com',
                emailVerificationSent: true,
                emailVerificationExpiresAt: expiresAt
            });
        });
    });

    describe('login', () => {
        it('should handle successful login returning tokens', async () => {
            const mockResult = { accessToken: 'access', refreshToken: 'refresh', expiresIn: 900, tokenType: 'Bearer', user: {} as any };
            jest.spyOn(authService, 'login').mockResolvedValue(mockResult);

            const res = mockResponse();
            await controller.login({ email: 'test@example.com', password: 'Password1!' }, '127.0.0.1', 'user-agent', res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ status: 'success', data: mockResult });
        });

        it('should handle 2FA required response', async () => {
            const mockResult = { requires2FA: true, authSessionId: 'sess123', methodsAvailable: ['totp'] as any };
            jest.spyOn(authService, 'login').mockResolvedValue(mockResult);

            const res = mockResponse();
            await controller.login({ email: 'test@example.com', password: 'Password1!' }, '127.0.0.1', 'user-agent', res);

            expect(res.status).toHaveBeenCalledWith(202);
            expect(res.json).toHaveBeenCalledWith({
                status: 'partial',
                message: 'Two-factor authentication required',
                data: mockResult
            });
        });
    });
});

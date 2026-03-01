jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('hashed_password'),
}));

import { RegistrationService } from '../../../src/services/registration.service';

describe('RegistrationService', () => {
    let service: RegistrationService;
    let mockPrismaWrite: any;
    let mockPrismaRead: any;
    let mockQueue: any;
    let mockConfig: any;
    let mockLogger: any;

    beforeEach(() => {
        mockPrismaRead = {
            user: {
                findUnique: jest.fn().mockResolvedValue(null),
                count: jest.fn().mockResolvedValue(0),
            },
        };
        mockPrismaWrite = {
            $transaction: jest.fn().mockImplementation(async (fn) => {
                const tx = {
                    user: { create: jest.fn().mockResolvedValue({ id: 'new-user-1', email: 'test@example.com', firstName: 'John', lastName: 'Doe' }) },
                    outbox: { create: jest.fn().mockResolvedValue({}) },
                };
                return fn(tx);
            }),
        };
        mockQueue = {
            publish: jest.fn().mockResolvedValue(undefined),
        };
        mockConfig = {
            get: jest.fn().mockReturnValue(12),
        };
        mockLogger = {
            error: jest.fn(),
            warn: jest.fn(),
            log: jest.fn(),
        };

        service = new RegistrationService(mockPrismaWrite, mockPrismaRead, mockQueue, mockConfig, mockLogger);
    });

    describe('registerUser', () => {
        const registerDto = {
            email: 'test@example.com',
            password: 'Password123!',
            firstName: 'John',
            lastName: 'Doe',
            phone: '+919999999999',
            marketingConsent: true,
        };

        it('should register a new user successfully', async () => {
            const result = await service.registerUser(registerDto);
            expect(result.user).toBeDefined();
            expect(result.emailVerificationToken).toBeDefined();
            expect(result.emailVerificationToken).toContain('verify_');
        });

        it('should throw ConflictException if email already exists', async () => {
            mockPrismaRead.user.findUnique.mockResolvedValue({ id: 'existing-user' });

            await expect(service.registerUser(registerDto))
                .rejects.toThrow();
            expect(mockLogger.warn).toHaveBeenCalled();
        });

        it('should lowercase email before saving', async () => {
            const dto = { ...registerDto, email: 'TEST@EXAMPLE.COM' };
            await service.registerUser(dto);

            expect(mockPrismaRead.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'test@example.com' },
            });
        });

        it('should create outbox event for user registration', async () => {
            await service.registerUser(registerDto);
            expect(mockPrismaWrite.$transaction).toHaveBeenCalled();
        });
    });

    describe('checkEmail', () => {
        it('should return true if email exists', async () => {
            mockPrismaRead.user.count.mockResolvedValue(1);

            const result = await service.checkEmail('test@example.com');
            expect(result).toBe(true);
        });

        it('should return false if email does not exist', async () => {
            mockPrismaRead.user.count.mockResolvedValue(0);

            const result = await service.checkEmail('new@example.com');
            expect(result).toBe(false);
        });

        it('should lowercase email before checking', async () => {
            await service.checkEmail('TEST@EXAMPLE.COM');
            expect(mockPrismaRead.user.count).toHaveBeenCalledWith({
                where: { email: 'test@example.com' },
            });
        });
    });
});

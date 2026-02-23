import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from '../../src/services/profile.service';
import { PrismaWriteService } from '@nestlancer/database/prisma/prisma-write.service';
import { PrismaReadService } from '@nestlancer/database/prisma/prisma-read.service';
import { BusinessLogicException } from '@nestlancer/common/exceptions/business-logic.exception';

describe('ProfileService', () => {
    let service: ProfileService;
    let prismaRead: PrismaReadService;
    let prismaWrite: PrismaWriteService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProfileService,
                {
                    provide: PrismaReadService,
                    useValue: { user: { findUnique: jest.fn() } },
                },
                {
                    provide: PrismaWriteService,
                    useValue: {
                        user: { update: jest.fn() },
                        outbox: { create: jest.fn() },
                    },
                },
            ],
        }).compile();

        service = module.get<ProfileService>(ProfileService);
        prismaRead = module.get<PrismaReadService>(PrismaReadService);
        prismaWrite = module.get<PrismaWriteService>(PrismaWriteService);
    });

    describe('getProfile', () => {
        it('should return formatted profile', async () => {
            const mockUser = {
                id: 'usr1',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                role: 'USER',
                emailVerified: true,
                preferences: { timezone: 'UTC', language: 'en', country: 'US' },
                authConfig: { twoFactorEnabled: false }
            };

            jest.spyOn(prismaRead.user, 'findUnique').mockResolvedValue(mockUser as any);

            const result = await service.getProfile('usr1');
            expect(result.id).toEqual('usr1');
            expect(result.timezone).toEqual('UTC');
        });

        it('should throw exception if user not found', async () => {
            jest.spyOn(prismaRead.user, 'findUnique').mockResolvedValue(null);

            await expect(service.getProfile('usr1')).rejects.toThrow(BusinessLogicException);
        });
    });
});

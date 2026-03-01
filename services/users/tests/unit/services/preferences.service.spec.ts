import { PreferencesService } from '../../../src/services/preferences.service';

describe('PreferencesService', () => {
    let service: PreferencesService;
    let mockPrismaWrite: any;
    let mockPrismaRead: any;

    beforeEach(() => {
        mockPrismaRead = {
            userPreferences: {
                findUnique: jest.fn().mockResolvedValue({
                    emailNotifications: { marketing: true, updates: true },
                    privacySettings: { profilePublic: true },
                }),
            },
        };
        mockPrismaWrite = {
            userPreferences: {
                upsert: jest.fn().mockResolvedValue({
                    emailNotifications: { marketing: false, updates: true },
                    privacySettings: { profilePublic: false },
                    updatedAt: new Date(),
                }),
            },
        };

        service = new PreferencesService(mockPrismaWrite, mockPrismaRead);
    });

    describe('getPreferences', () => {
        it('should return user preferences', async () => {
            const result = await service.getPreferences('user-1');
            expect(result.notifications).toEqual({ marketing: true, updates: true });
            expect(result.privacy).toEqual({ profilePublic: true });
        });

        it('should return empty objects when no preferences exist', async () => {
            mockPrismaRead.userPreferences.findUnique.mockResolvedValue(null);

            const result = await service.getPreferences('user-1');
            expect(result.notifications).toEqual({});
            expect(result.privacy).toEqual({});
        });
    });

    describe('updatePreferences', () => {
        it('should update preferences', async () => {
            const dto = {
                notifications: { marketing: false, updates: true },
                privacy: { profilePublic: false },
            };

            const result = await service.updatePreferences('user-1', dto as any);
            expect(result.notifications).toBeDefined();
            expect(result.privacy).toBeDefined();
            expect(result.updatedAt).toBeDefined();
            expect(mockPrismaWrite.userPreferences.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { userId: 'user-1' },
                })
            );
        });
    });
});

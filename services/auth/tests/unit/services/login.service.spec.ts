jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';
import { LoginService } from '../../../src/services/login.service';

describe('LoginService', () => {
  let service: LoginService;
  let mockPrismaRead: any;
  let mockPrismaWrite: any;
  let mockLockoutService: any;
  let mockTokenService: any;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    passwordHash: 'hashed_password',
    status: 'ACTIVE',
    emailVerified: true,
    authConfig: { twoFactorEnabled: false },
    firstName: 'John',
    lastName: 'Doe',
    role: 'USER',
  };

  beforeEach(() => {
    mockPrismaRead = {
      user: {
        findUnique: jest.fn().mockResolvedValue(mockUser),
      },
    };
    mockPrismaWrite = {
      authSession: {
        create: jest.fn().mockResolvedValue({}),
      },
    };
    mockLockoutService = {
      checkLockout: jest.fn().mockResolvedValue(undefined),
      handleFailedAttempt: jest.fn().mockResolvedValue(4),
      resetFailedAttempts: jest.fn().mockResolvedValue(undefined),
    };
    mockTokenService = {
      generateAuthTokens: jest.fn().mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 900,
        tokenType: 'Bearer',
        user: { id: 'user-1' },
      }),
    };

    service = new LoginService(
      mockPrismaRead,
      mockPrismaWrite,
      mockLockoutService,
      mockTokenService,
    );
  });

  describe('authenticate', () => {
    const loginDto = { email: 'test@example.com', password: 'Password123!', rememberMe: false };
    const ipAddress = '127.0.0.1';
    const userAgent = 'TestAgent/1.0';

    it('should authenticate successfully with valid credentials', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.authenticate(loginDto, ipAddress, userAgent);
      expect(result.accessToken).toBe('access-token');
      expect(mockLockoutService.checkLockout).toHaveBeenCalledWith('user-1');
      expect(mockLockoutService.resetFailedAttempts).toHaveBeenCalledWith('user-1');
      expect(mockTokenService.generateAuthTokens).toHaveBeenCalled();
    });

    it('should throw BusinessLogicException for non-existent user', async () => {
      mockPrismaRead.user.findUnique.mockResolvedValue(null);

      await expect(service.authenticate(loginDto, ipAddress, userAgent)).rejects.toThrow();
    });

    it('should throw ForbiddenException for suspended accounts', async () => {
      mockPrismaRead.user.findUnique.mockResolvedValue({ ...mockUser, status: 'SUSPENDED' });

      await expect(service.authenticate(loginDto, ipAddress, userAgent)).rejects.toThrow();
    });

    it('should throw BusinessLogicException for invalid password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.authenticate(loginDto, ipAddress, userAgent)).rejects.toThrow();
      expect(mockLockoutService.handleFailedAttempt).toHaveBeenCalledWith(
        'user-1',
        mockUser.authConfig,
      );
    });

    it('should throw ForbiddenException for unverified email', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockPrismaRead.user.findUnique.mockResolvedValue({ ...mockUser, emailVerified: false });

      await expect(service.authenticate(loginDto, ipAddress, userAgent)).rejects.toThrow();
    });

    it('should return 2FA challenge when 2FA is enabled', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockPrismaRead.user.findUnique.mockResolvedValue({
        ...mockUser,
        authConfig: { twoFactorEnabled: true },
      });

      const result = await service.authenticate(loginDto, ipAddress, userAgent);
      expect(result.requires2FA).toBe(true);
      expect(result.authSessionId).toBeDefined();
      expect(result.methodsAvailable).toContain('totp');
      expect(mockPrismaWrite.authSession.create).toHaveBeenCalled();
    });

    it('should lowercase email before lookup', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const upperDto = { ...loginDto, email: 'TEST@EXAMPLE.COM' };

      await service.authenticate(upperDto, ipAddress, userAgent);
      expect(mockPrismaRead.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        include: { authConfig: true },
      });
    });
  });
});

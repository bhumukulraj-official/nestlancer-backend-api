import { Test, TestingModule } from '@nestjs/testing';
import { ImpersonationService } from '../../../src/services/impersonation.service';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@nestlancer/common';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ImpersonateUserDto } from '../../../src/dto/impersonate-user.dto';

describe('ImpersonationService', () => {
  let service: ImpersonationService;
  let prismaWrite: jest.Mocked<PrismaWriteService>;
  let prismaRead: jest.Mocked<PrismaReadService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImpersonationService,
        {
          provide: PrismaWriteService,
          useValue: {
            impersonationSession: {
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: PrismaReadService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
            impersonationSession: {
              findMany: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ImpersonationService>(ImpersonationService);
    prismaWrite = module.get(PrismaWriteService);
    prismaRead = module.get(PrismaReadService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('startImpersonation', () => {
    it('should throw NotFoundException if target user not found', async () => {
      prismaRead.user.findUnique.mockResolvedValue(null);
      await expect(service.startImpersonation('admin1', 'user1', {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if target user is admin', async () => {
      prismaRead.user.findUnique.mockResolvedValue({ id: 'user1', role: UserRole.ADMIN } as any);
      await expect(service.startImpersonation('admin1', 'user1', {} as any)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should start impersonation session successfully', async () => {
      const targetUser = { id: 'user1', email: 'test@user.com', role: UserRole.USER };
      prismaRead.user.findUnique.mockResolvedValue(targetUser as any);
      const session = { id: 'session1' };
      prismaWrite.impersonationSession.create.mockResolvedValue(session as any);
      jwtService.sign.mockReturnValue('mock-jwt-token');
      configService.get.mockReturnValue('secret');

      const dto: ImpersonateUserDto = { reason: 'support ticket' };
      const result = await service.startImpersonation('admin1', 'user1', dto);

      expect(prismaWrite.impersonationSession.create).toHaveBeenCalled();
      expect(jwtService.sign).toHaveBeenCalled();
      expect(result.token).toBe('mock-jwt-token');
      expect(result.impersonationSessionId).toBe(session.id);
      expect(result.impersonatedUser.id).toBe(targetUser.id);
    });
  });

  describe('endImpersonation', () => {
    it('should end impersonation successfully', async () => {
      const session = { id: 'session1', endedAt: new Date() };
      prismaWrite.impersonationSession.update.mockResolvedValue(session as any);

      const result = await service.endImpersonation('session1');

      expect(prismaWrite.impersonationSession.update).toHaveBeenCalledWith({
        where: { id: 'session1' },
        data: expect.objectContaining({ endedAt: expect.any(Date) }),
      });
      expect(result.success).toBe(true);
    });
  });

  describe('getActiveSessions', () => {
    it('should return all active sessions', async () => {
      const sessions = [{ id: '1' }];
      prismaRead.impersonationSession.findMany.mockResolvedValue(sessions as any);

      const result = await service.getActiveSessions();

      expect(prismaRead.impersonationSession.findMany).toHaveBeenCalledWith({
        where: { endedAt: null },
        orderBy: { startedAt: 'desc' },
      });
      expect(result).toEqual(sessions);
    });
  });
});

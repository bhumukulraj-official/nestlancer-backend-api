import { Injectable } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { BusinessLogicException } from '@nestlancer/common';
import { NestlancerConfigService as ConfigService } from '@nestlancer/config';

@Injectable()
export class AccountLockoutService {
  constructor(
    private readonly prismaRead: PrismaReadService,
    private readonly prismaWrite: PrismaWriteService,
    private readonly config: ConfigService,
  ) {}

  async checkLockout(userId: string): Promise<void> {
    const authConfig = await this.prismaRead.userAuthConfig.findUnique({
      where: { userId },
    });

    if (authConfig?.lockedUntil && authConfig.lockedUntil > new Date()) {
      throw new BusinessLogicException(
        'Account temporarily locked due to multiple failed login attempts',
        'AUTH_003',
        {
          lockedUntil: authConfig.lockedUntil,
          reason: 'tooManyFailedAttempts',
          lockDuration:
            (this.config.get<number>('authService.security.lockoutDurationMs') ?? 1800000) / 1000,
        },
      );
    }
  }

  async handleFailedAttempt(userId: string, authConfig: any): Promise<number> {
    const maxAttempts = this.config.get<number>('authService.security.maxFailedAttempts') || 5;
    const lockoutDurationMs =
      this.config.get<number>('authService.security.lockoutDurationMs') || 1800000;

    // Only increment if not already locked
    if (authConfig?.lockedUntil && authConfig.lockedUntil > new Date()) {
      return 0;
    }

    const currentAttempts = (authConfig?.failedLoginAttempts || 0) + 1;
    let lockedUntil = null;

    if (currentAttempts >= maxAttempts) {
      lockedUntil = new Date(Date.now() + lockoutDurationMs);
    }

    await this.prismaWrite.userAuthConfig.upsert({
      where: { userId },
      update: {
        failedLoginAttempts: currentAttempts,
        lastFailedLoginAttempt: new Date(),
        lockedUntil,
      },
      create: {
        userId,
        failedLoginAttempts: currentAttempts,
        lastFailedLoginAttempt: new Date(),
        lockedUntil,
      },
    });

    if (lockedUntil) {
      throw new BusinessLogicException(
        'Account temporarily locked due to multiple failed login attempts',
        'AUTH_003',
        {
          lockedUntil,
          reason: 'tooManyFailedAttempts',
          lockDuration: lockoutDurationMs / 1000,
        },
      );
    }

    return Math.max(0, maxAttempts - currentAttempts);
  }

  async resetFailedAttempts(userId: string): Promise<void> {
    await this.prismaWrite.userAuthConfig.updateMany({
      where: { userId, failedLoginAttempts: { gt: 0 } },
      data: {
        failedLoginAttempts: 0,
        lastFailedLoginAttempt: null,
        lockedUntil: null,
      },
    });
  }
}

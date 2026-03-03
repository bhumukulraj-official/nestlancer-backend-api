import { Injectable } from '@nestjs/common';
import { PrismaReadService, PrismaWriteService } from '@nestlancer/database';
import { BusinessLogicException, UserStatus } from '@nestlancer/common';
import { AccountLockoutService } from './account-lockout.service';
import { TokenService } from './token.service';
import { LoginDto } from '../dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LoginService {
    constructor(
        private readonly prismaRead: PrismaReadService,
        private readonly prismaWrite: PrismaWriteService,
        private readonly lockoutService: AccountLockoutService,
        private readonly tokenService: TokenService,
    ) { }

    async authenticate(dto: LoginDto, ipAddress: string, userAgent: string) {
        const user = await this.prismaRead.user.findUnique({
            where: { email: dto.email.toLowerCase() },
            include: { authConfig: true },
        });

        if (!user) {
            throw new BusinessLogicException('Invalid email or password', 'AUTH_001');
        }

        if (user.status === UserStatus.SUSPENDED) {
            throw new BusinessLogicException('Account is suspended', 'AUTH_014');
        }

        await this.lockoutService.checkLockout(user.id);

        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

        if (!isPasswordValid) {
            const attemptsRemaining = await this.lockoutService.handleFailedAttempt(user.id, user.authConfig);
            throw new BusinessLogicException('Invalid email or password', 'AUTH_001', { attemptsRemaining });
        }

        if (!user.emailVerified) {
            throw new BusinessLogicException('Email address not verified', 'AUTH_002', {
                email: user.email
            });
        }

        await this.lockoutService.resetFailedAttempts(user.id);

        if (user.authConfig?.twoFactorEnabled) {
            const authSessionId = `sess2Fa_${Math.random().toString(36).substr(2, 9)}`;

            // Store pending 2FA session in DB or Cache
            await this.prismaWrite.authSession.create({
                data: {
                    id: authSessionId,
                    userId: user.id,
                    ipAddress,
                    userAgent,
                    type: '2FA_PENDING',
                    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
                }
            });

            return {
                requires2FA: true,
                authSessionId,
                methodsAvailable: ['totp', 'backupCode'],
            };
        }

        return this.tokenService.generateAuthTokens(user, dto.rememberMe, ipAddress, userAgent);
    }
}

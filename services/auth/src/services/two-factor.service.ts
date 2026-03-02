import { Injectable } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { BusinessLogicException } from '@nestlancer/common';
import { TokenService } from './token.service';
import { AccountLockoutService } from './account-lockout.service';
import { authenticator } from 'otplib';

@Injectable()
export class TwoFactorService {
    constructor(
        private readonly prismaRead: PrismaReadService,
        private readonly prismaWrite: PrismaWriteService,
        private readonly tokenService: TokenService,
        private readonly lockoutService: AccountLockoutService,
    ) {
        authenticator.options = { window: 1 };
    }

    async verify2FA(authSessionId: string, code: string, method: 'totp' | 'backupCode') {
        const session = await this.prismaRead.authSession.findUnique({
            where: { id: authSessionId },
            include: {
                user: {
                    include: { authConfig: true }
                }
            }
        });

        if (!session || session.type !== '2FA_PENDING') {
            throw new BusinessLogicException('Authentication session expird or invalid', 'AUTH_009');
        }

        if (session.expiresAt < new Date()) {
            await this.prismaWrite.authSession.delete({ where: { id: authSessionId } });
            throw new BusinessLogicException('Authentication session expired', 'AUTH_009', {
                authSessionId,
                expiredAt: session.expiresAt
            });
        }

        const { user } = session;

        if (method === 'totp') {
            const isValid = authenticator.verify({
                token: code,
                secret: user.authConfig.twoFactorSecret,
            });

            if (!isValid) {
                const attemptsRemaining = await this.lockoutService.handleFailedAttempt(user.id, user.authConfig);
                throw new BusinessLogicException('Invalid 2FA code', 'AUTH_005', {
                    method: 'totp',
                    attemptsRemaining
                });
            }
        } else if (method === 'backupCode') {
            const backupCodes = user.authConfig.backupCodes as string[];
            const codeIndex = backupCodes.indexOf(code);

            if (codeIndex === -1) {
                const attemptsRemaining = await this.lockoutService.handleFailedAttempt(user.id, user.authConfig);
                throw new BusinessLogicException('Invalid backup code', 'AUTH_005', {
                    method: 'backupCode',
                    attemptsRemaining
                });
            }

            // Remove the used backup code
            backupCodes.splice(codeIndex, 1);
            await this.prismaWrite.userAuthConfig.update({
                where: { userId: user.id },
                data: { backupCodes }
            });
        }

        await this.lockoutService.resetFailedAttempts(user.id);

        // Session successfully verified, delete it
        await this.prismaWrite.authSession.delete({ where: { id: authSessionId } });

        // Generate real tokens
        return this.tokenService.generateAuthTokens(user, false, session.ipAddress, session.userAgent);
    }
}

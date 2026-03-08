import { Injectable } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { BusinessLogicException } from '@nestlancer/common';

@Injectable()
export class TwoFactorService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
    ) { }

    async enable2FA(userId: string, dto: { password: string }) {
        const user = await this.prismaRead.user.findUnique({ where: { id: userId } });
        if (!user) throw new BusinessLogicException('User not found', 'USER_001');

        // TODO: Generate TOTP secret and QR code
        const secret = `TOTP_SECRET_${Date.now()}`;
        const qrCodeUrl = `otpauth://totp/Nestlancer:${user.email}?secret=${secret}&issuer=Nestlancer`;

        return {
            secret,
            qrCodeUrl,
            message: '2FA setup initiated. Verify with a code from your authenticator app.',
        };
    }

    async verify2FASetup(userId: string, dto: { code: string }) {
        const user = await this.prismaRead.user.findUnique({ where: { id: userId } });
        if (!user) throw new BusinessLogicException('User not found', 'USER_001');

        // TODO: Verify TOTP code against stored secret
        await this.prismaWrite.user.update({
            where: { id: userId },
            data: { twoFactorEnabled: true },
        });

        // Generate backup codes
        const backupCodes = Array.from({ length: 10 }, () =>
            Math.random().toString(36).substring(2, 10).toUpperCase()
        );

        return {
            enabled: true,
            backupCodes,
            message: '2FA enabled successfully. Save your backup codes securely.',
        };
    }

    async disable2FA(userId: string, dto: { password: string; code: string }) {
        const user = await this.prismaRead.user.findUnique({ where: { id: userId } });
        if (!user) throw new BusinessLogicException('User not found', 'USER_001');

        // TODO: Verify password and 2FA code before disabling
        await this.prismaWrite.user.update({
            where: { id: userId },
            data: { twoFactorEnabled: false },
        });

        return { enabled: false, message: '2FA disabled successfully.' };
    }

    async get2FAStatus(userId: string) {
        const user = await this.prismaRead.user.findUnique({
            where: { id: userId },
            select: { twoFactorEnabled: true },
        });
        if (!user) throw new BusinessLogicException('User not found', 'USER_001');

        return {
            enabled: user.twoFactorEnabled || false,
            method: user.twoFactorEnabled ? 'totp' : null,
        };
    }

    async getBackupCodes(userId: string) {
        const user = await this.prismaRead.user.findUnique({ where: { id: userId } });
        if (!user) throw new BusinessLogicException('User not found', 'USER_001');

        // TODO: Retrieve stored backup codes
        return {
            codes: [],
            remainingCount: 0,
            generatedAt: null,
        };
    }

    async regenerateBackupCodes(userId: string, dto: { password: string }) {
        const user = await this.prismaRead.user.findUnique({ where: { id: userId } });
        if (!user) throw new BusinessLogicException('User not found', 'USER_001');

        const backupCodes = Array.from({ length: 10 }, () =>
            Math.random().toString(36).substring(2, 10).toUpperCase()
        );

        // TODO: Store new backup codes (hashed)
        return {
            codes: backupCodes,
            remainingCount: backupCodes.length,
            generatedAt: new Date().toISOString(),
            message: 'Backup codes regenerated. Previous codes are now invalid.',
        };
    }
}

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaWriteService } from '@nestlancer/database/prisma/prisma-write.service';
import { PrismaReadService } from '@nestlancer/database/prisma/prisma-read.service';
import { BusinessLogicException } from '@nestlancer/common/exceptions/business-logic.exception';
import { JwtPayload } from '@nestlancer/common/types/jwt-payload.type';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TokenService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
    ) { }

    async generateAuthTokens(user: any, rememberMe: boolean = false, ipAddress?: string, userAgent?: string) {
        const accessExpiresIn = this.configService.get<number>('authService.jwt.accessExpiresIn') || 900;
        const refreshExpiresIn = rememberMe
            ? 30 * 24 * 60 * 60 // 30 days
            : this.configService.get<number>('authService.jwt.refreshExpiresIn') || 604800; // 7 days

        const accessJti = uuidv4();
        const refreshJti = uuidv4();

        const accessPayload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            type: 'access',
            jti: accessJti,
        };

        const refreshPayload = {
            sub: user.id,
            type: 'refresh',
            jti: refreshJti,
        };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(accessPayload, {
                privateKey: this.configService.get<string>('authService.jwt.accessPrivateKey'),
                algorithm: 'RS256',
                expiresIn: accessExpiresIn,
                issuer: this.configService.get<string>('authService.jwt.issuer'),
                audience: this.configService.get<string>('authService.jwt.audience'),
            }),
            this.jwtService.signAsync(refreshPayload, {
                privateKey: this.configService.get<string>('authService.jwt.refreshPrivateKey'),
                algorithm: 'RS256',
                expiresIn: refreshExpiresIn,
                issuer: this.configService.get<string>('authService.jwt.issuer'),
                audience: this.configService.get<string>('authService.jwt.audience'),
            }),
        ]);

        // Track active refresh tokens
        await this.prismaWrite.userSession.create({
            data: {
                userId: user.id,
                refreshTokenJti: refreshJti,
                ipAddress: ipAddress || 'unknown',
                userAgent: userAgent || 'unknown',
                expiresAt: new Date(Date.now() + refreshExpiresIn * 1000),
            }
        });

        return {
            accessToken,
            refreshToken,
            expiresIn: accessExpiresIn,
            tokenType: 'Bearer',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                avatar: user.avatar,
                emailVerified: user.emailVerified,
                twoFactorEnabled: user.authConfig?.twoFactorEnabled || false,
            }
        };
    }

    async refreshToken(token: string, ipAddress: string, userAgent: string) {
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                publicKey: this.configService.get<string>('authService.jwt.refreshPublicKey'),
                algorithms: ['RS256'],
                issuer: this.configService.get<string>('authService.jwt.issuer'),
            });

            if (payload.type !== 'refresh') {
                throw new BusinessLogicException('Invalid token type', 'AUTH_004');
            }

            const session = await this.prismaRead.userSession.findFirst({
                where: {
                    userId: payload.sub,
                    refreshTokenJti: payload.jti,
                    isRevoked: false,
                    expiresAt: { gt: new Date() }
                }
            });

            if (!session) {
                throw new BusinessLogicException('Session expired or revoked', 'AUTH_004', { reason: 'sessionRevoked' });
            }

            const user = await this.prismaRead.user.findUnique({
                where: { id: payload.sub },
                include: { authConfig: true }
            });

            if (!user || user.status !== 'ACTIVE') {
                throw new BusinessLogicException('User account not active', 'AUTH_004');
            }

            // Revoke old session
            await this.prismaWrite.userSession.update({
                where: { id: session.id },
                data: { isRevoked: true }
            });

            // Generate new tokens
            const result = await this.generateAuthTokens(user, false, ipAddress, userAgent);

            // Only return the tokens to match DTO specs, excluding full user obj on refresh if desired
            return {
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
                expiresIn: result.expiresIn,
                tokenType: result.tokenType
            };

        } catch (error) {
            if (error instanceof BusinessLogicException) throw error;
            throw new BusinessLogicException('Invalid or expired refresh token', 'AUTH_004', { reason: 'tokenExpired' });
        }
    }
}

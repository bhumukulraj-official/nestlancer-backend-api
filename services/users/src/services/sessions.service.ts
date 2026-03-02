import { Injectable } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { BusinessLogicException } from '@nestlancer/common';
import { UAParser } from 'ua-parser-js';

@Injectable()
export class SessionsService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
    ) { }

    async getSessions(userId: string, currentJti: string) {
        const sessions = await this.prismaRead.userSession.findMany({
            where: {
                userId,
                isRevoked: false,
                expiresAt: { gt: new Date() }
            },
            orderBy: { lastActivityAt: 'desc' }
        });

        return sessions.map(s => {
            const parser = new UAParser(s.userAgent);
            return {
                id: s.id,
                device: {
                    type: parser.getDevice().type || 'desktop',
                    browser: `${parser.getBrowser().name} ${parser.getBrowser().version}`,
                    os: `${parser.getOS().name} ${parser.getOS().version}`
                },
                location: {
                    ip: s.ipAddress,
                    // Geographic mapping would go here
                },
                current: s.refreshTokenJti === currentJti,
                createdAt: s.createdAt,
                lastActivityAt: s.lastActivityAt,
                expiresAt: s.expiresAt
            };
        });
    }

    async terminateSession(userId: string, sessionId: string, currentJti: string) {
        const session = await this.prismaRead.userSession.findUnique({
            where: { id: sessionId }
        });

        if (!session || session.userId !== userId) {
            throw new BusinessLogicException('Session not found', 'USER_003');
        }

        if (session.refreshTokenJti === currentJti) {
            throw new BusinessLogicException('Cannot terminate current session. Use logout instead.', 'USER_004');
        }

        await this.prismaWrite.userSession.update({
            where: { id: sessionId },
            data: { isRevoked: true }
        });

        return { sessionId, terminatedAt: new Date() };
    }

    async terminateOtherSessions(userId: string, currentJti: string) {
        await this.prismaWrite.userSession.updateMany({
            where: {
                userId,
                refreshTokenJti: { not: currentJti },
                isRevoked: false
            },
            data: { isRevoked: true }
        });

        return true;
    }
}

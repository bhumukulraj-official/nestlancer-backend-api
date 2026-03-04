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
        const sessions = await this.prismaRead.session.findMany({
            where: {
                userId,
                expiresAt: { gt: new Date() }
            },
            orderBy: { lastActiveAt: 'desc' }
        });

        return sessions.map((s: any) => {
            const parser = new UAParser(s.userAgent);
            return {
                id: s.id,
                device: {
                    type: parser.getDevice().type || 'desktop',
                    browser: `${parser.getBrowser().name} ${parser.getBrowser().version}`,
                    os: `${parser.getOS().name} ${parser.getOS().version}`
                },
                location: {
                    ip: s.ip,
                    // Geographic mapping would go here
                },
                current: s.token === currentJti,
                createdAt: s.createdAt,
                lastActivityAt: s.lastActiveAt,
                expiresAt: s.expiresAt
            };
        });
    }

    async terminateSession(userId: string, sessionId: string, currentJti: string) {
        const session = await this.prismaRead.session.findUnique({
            where: { id: sessionId }
        });

        if (!session || session.userId !== userId) {
            throw new BusinessLogicException('Session not found', 'USER_003');
        }

        if (session.token === currentJti) {
            throw new BusinessLogicException('Cannot terminate current session. Use logout instead.', 'USER_004');
        }

        await this.prismaWrite.session.update({
            where: { id: sessionId },
            data: { expiresAt: new Date() }
        });

        return { sessionId, terminatedAt: new Date() };
    }

    async terminateOtherSessions(userId: string, currentJti: string) {
        await this.prismaWrite.session.updateMany({
            where: {
                userId,
                token: { not: currentJti },
                expiresAt: { gt: new Date() }
            },
            data: { expiresAt: new Date() }
        });

        return true;
    }
}

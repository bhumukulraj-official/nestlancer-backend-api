import { ConfigService } from '@nestjs/config';
import { Injectable, ForbiddenException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { JwtService } from '@nestjs/jwt';
// import removed - ConfigService not exported from '@nestlancer/config';
import { UserRole } from '@nestlancer/common';
import { ImpersonateUserDto } from '../dto/impersonate-user.dto';
import { ADMIN_CONFIG } from '../config/admin.config';

@Injectable()
export class ImpersonationService {
  private readonly logger = new Logger(ImpersonationService.name);

  constructor(
    private readonly prismaWrite: PrismaWriteService,
    private readonly prismaRead: PrismaReadService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async startImpersonation(adminId: string, targetUserId: string, dto: ImpersonateUserDto) {
    // Basic structural check if user exists and isn't admin
    const targetUser = await this.prismaRead.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) throw new NotFoundException('User not found');

    if (targetUser.role === UserRole.ADMIN) {
      throw new ForbiddenException({
        code: 'ADMIN_008',
        message: 'Cannot impersonate admin users',
        details: { targetUserId, targetUserRole: targetUser.role },
      });
    }

    const session = await this.prismaWrite.impersonationSession.create({
      data: {
        adminId,
        targetUserId,
        reason: dto.reason,
        ticketId: dto.ticketId,
        startedAt: new Date(),
      },
    });

    const payload = {
      sub: targetUser.id,
      email: targetUser.email,
      role: targetUser.role,
      isImpersonated: true,
      originalAdminId: adminId,
      impersonationSessionId: session.id,
    };

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: `${ADMIN_CONFIG.MAX_IMPERSONATION_DURATION_HOURS}h`,
    });

    this.logger.log(`Admin ${adminId} started impersonating user ${targetUserId}`);

    return {
      impersonationSessionId: session.id,
      originalUser: { id: adminId, role: UserRole.ADMIN },
      impersonatedUser: { id: targetUser.id, email: targetUser.email, role: targetUser.role },
      token,
      expiresAt: new Date(Date.now() + ADMIN_CONFIG.MAX_IMPERSONATION_DURATION_HOURS * 3600000),
      restrictions: ['Cannot change password', 'Cannot delete account', 'Cannot modify 2FA'],
    };
  }

  async endImpersonation(sessionId: string) {
    try {
      const session = await this.prismaWrite.impersonationSession.update({
        where: { id: sessionId },
        data: { endedAt: new Date() },
      });
      return { success: true, message: 'Impersonation ended', session };
    } catch (err: any) {
      if (err?.code === 'P2025') {
        throw new NotFoundException('Impersonation session not found');
      }
      throw err;
    }
  }

  async getActiveSessions() {
    return this.prismaRead.impersonationSession.findMany({
      where: { endedAt: null },
      orderBy: { startedAt: 'desc' },
    });
  }
}

import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@nestlancer/auth-lib';
import { UserRole, SuccessResponse } from '@nestlancer/common';
import { SuperAdminGuard } from '../../guards/super-admin.guard';

import { ImpersonationService } from '../../services/impersonation.service';
import { ImpersonateUserDto } from '../../dto/impersonate-user.dto';

/**
 * Controller for managing administrative user impersonation sessions.
 * Provides endpoints for starting and ending impersonation, and auditing active sessions.
 * 
 * @category Admin
 */
@ApiTags('Admin - User Impersonation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, SuperAdminGuard)
@Roles(UserRole.ADMIN)
@Controller('users')
export class ImpersonationAdminController {
    constructor(private readonly impersonationService: ImpersonationService) { }

    /**
     * Initiates a new impersonation session for a target user.
     * 
     * @param userId The unique identifier of the user to be impersonated
     * @param dto Reason and duration for the impersonation
     * @param req Express request object containing the admin's identity
     * @returns Encrypted impersonation token and session details
     */
    @Post(':userId/impersonate')
    @ApiOperation({ summary: 'Start impersonation session', description: 'Create a temporary session allowing an administrator to act on behalf of another user.' })
    @SuccessResponse('Impersonation session started')
    async start(@Param('userId') userId: string, @Body() dto: ImpersonateUserDto, @Req() req: any): Promise<any> {
        return this.impersonationService.startImpersonation(req.user.sub, userId, dto);
    }

    /**
     * Terminates an active impersonation session.
     * 
     * @param sessionId The unique identifier of the impersonation session
     * @returns Confirmation of session termination
     */
    @Post('impersonate/end/:sessionId')
    @ApiOperation({ summary: 'End impersonation session', description: 'Gracefully close an active impersonation session and invalidate its tokens.' })
    @SuccessResponse('Impersonation ended')
    async end(@Param('sessionId') sessionId: string): Promise<any> {
        return this.impersonationService.endImpersonation(sessionId);
    }

    /**
     * Retrieves a list of all currently active impersonation sessions.
     * 
     * @returns Array of active session metadata
     */
    @Get('/impersonate/sessions')
    @ApiOperation({ summary: 'List active impersonation sessions', description: 'Fetch all ongoing impersonation events for auditing purposes.' })
    @SuccessResponse('Sessions retrieved')
    async listActive(): Promise<any> {
        return this.impersonationService.getActiveSessions();
    }
}

import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@nestlancer/auth-lib';
import { UserRole } from '@nestlancer/common/enums/role.enum';
import { SuccessResponse } from '@nestlancer/common/decorators/success-response.decorator';
import { SuperAdminGuard } from '../../guards/super-admin.guard';

import { ImpersonationService } from '../../services/impersonation.service';
import { ImpersonateUserDto } from '../../dto/impersonate-user.dto';

@ApiTags('Admin - User Impersonation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, SuperAdminGuard)
@Roles(UserRole.ADMIN)
@Controller('users')
export class ImpersonationAdminController {
    constructor(private readonly impersonationService: ImpersonationService) { }

    @Post(':userId/impersonate')
    @ApiOperation({ summary: 'Start impersonation session' })
    @SuccessResponse('Impersonation session started')
    async start(@Param('userId') userId: string, @Body() dto: ImpersonateUserDto, @Req() req: any) {
        return this.impersonationService.startImpersonation(req.user.sub, userId, dto);
    }

    @Post('/impersonate/end/:sessionId')
    @ApiOperation({ summary: 'End impersonation session' })
    @SuccessResponse('Impersonation ended')
    async end(@Param('sessionId') sessionId: string) {
        return this.impersonationService.endImpersonation(sessionId);
    }

    @Get('/impersonate/sessions')
    @ApiOperation({ summary: 'List active impersonation sessions' })
    @SuccessResponse('Sessions retrieved')
    async listActive() {
        return this.impersonationService.getActiveSessions();
    }
}

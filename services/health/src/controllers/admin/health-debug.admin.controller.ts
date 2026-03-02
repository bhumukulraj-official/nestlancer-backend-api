import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserRole, Roles } from '@nestlancer/common';
import { HealthService } from '../../services/health.service';
import { JwtAuthGuard, RolesGuard } from '@nestlancer/auth-lib';

@Controller('debug')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class HealthDebugAdminController {
    constructor(private readonly healthService: HealthService) { }

    @Get()
    async getDebugInfo() {
        return this.healthService.getDebugHealth();
    }
}

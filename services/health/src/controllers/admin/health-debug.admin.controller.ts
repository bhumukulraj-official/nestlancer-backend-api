import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from '@nestlancer/common/decorators/roles.decorator';
import { HealthService } from '../../services/health.service';
import { JwtAuthGuard } from '@nestlancer/auth-lib/guards/jwt-auth.guard';
import { RolesGuard } from '@nestlancer/auth-lib/guards/roles.guard';

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

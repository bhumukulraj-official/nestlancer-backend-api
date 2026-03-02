import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@nestlancer/common';

@Injectable()
export class SuperAdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || user.role !== UserRole.ADMIN) {
            throw new ForbiddenException({
                code: 'ADMIN_001',
                message: 'Admin access required',
            });
        }

        // In a real scenario, this might check a specific "isSuperAdmin" flag or specific permission scope
        // Currently relying on UserRole.ADMIN but leaving structure for extension per project requirements.

        return true;
    }
}

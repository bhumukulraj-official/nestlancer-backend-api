import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@nestlancer/common';

/**
 * Guard that restricts access to ADMIN role only.
 * Use on admin-service routes; throws 403 with code ADMIN_001 when the user is not an admin.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== UserRole.ADMIN) {
      throw new ForbiddenException({
        code: 'ADMIN_001',
        message: 'Admin access required',
      });
    }

    return true;
  }
}

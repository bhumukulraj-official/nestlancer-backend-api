import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class MaintenanceGuard implements CanActivate {
  private maintenanceMode = false;

  setMaintenanceMode(enabled: boolean): void { this.maintenanceMode = enabled; }

  canActivate(context: ExecutionContext): boolean {
    if (!this.maintenanceMode) return true;
    const req = context.switchToHttp().getRequest();
    if (req.path?.includes('/health')) return true;
    if (req.user?.role === 'ADMIN') return true;
    throw new HttpException({ code: 'SYS_MAINTENANCE', message: 'System is under maintenance' }, HttpStatus.SERVICE_UNAVAILABLE);
  }
}

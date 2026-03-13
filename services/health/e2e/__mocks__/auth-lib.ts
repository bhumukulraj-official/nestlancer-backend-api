import { CanActivate, ExecutionContext, Injectable, Module } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    // Allow all requests in E2E tests for this service
    return true;
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    // Allow all requests in E2E tests for this service
    return true;
  }
}

@Module({
  providers: [JwtAuthGuard, RolesGuard],
  exports: [JwtAuthGuard, RolesGuard],
})
export class AuthLibModule {}


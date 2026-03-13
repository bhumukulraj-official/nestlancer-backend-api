import { SetMetadata } from '@nestjs/common';

export function Public(): ClassDecorator & MethodDecorator {
  return () => {
    // no-op for E2E tests
  };
}

export function Cacheable(_options?: { ttl?: number }): MethodDecorator {
  return () => {
    // no-op cache decorator for E2E tests
  };
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export function Roles(...roles: UserRole[]): ClassDecorator & MethodDecorator {
  return SetMetadata('roles', roles);
}

export class AllExceptionsFilter {}

export class TransformResponseInterceptor {}


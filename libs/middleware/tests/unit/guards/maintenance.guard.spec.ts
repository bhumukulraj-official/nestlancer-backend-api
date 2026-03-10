import { Test, TestingModule } from '@nestjs/testing';
import { MaintenanceGuard } from '../../../src/guards/maintenance.guard';
import { ExecutionContext, HttpException } from '@nestjs/common';

describe('MaintenanceGuard', () => {
  let guard: MaintenanceGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MaintenanceGuard],
    }).compile();

    guard = module.get<MaintenanceGuard>(MaintenanceGuard);
  });

  it('should allow access when maintenance mode is off', () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ path: '/test' }),
      }),
    } as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should block access when maintenance mode is on', () => {
    guard.setMaintenanceMode(true);
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ path: '/test', user: { role: 'USER' } }),
      }),
    } as ExecutionContext;

    expect(() => guard.canActivate(context)).toThrow(HttpException);
  });

  it('should allow access for ADMIN even in maintenance mode', () => {
    guard.setMaintenanceMode(true);
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ path: '/test', user: { role: 'ADMIN' } }),
      }),
    } as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });
});

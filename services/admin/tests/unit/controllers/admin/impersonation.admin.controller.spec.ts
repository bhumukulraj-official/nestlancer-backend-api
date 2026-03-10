import { Test, TestingModule } from '@nestjs/testing';
import { ImpersonationAdminController } from '../../../../src/controllers/admin/impersonation.admin.controller';
import { ImpersonationService } from '../../../../src/services/impersonation.service';
import { JwtAuthGuard, RolesGuard } from '@nestlancer/auth-lib';
import { SuperAdminGuard } from '../../../../src/guards/super-admin.guard';

describe('ImpersonationAdminController', () => {
  let controller: ImpersonationAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImpersonationAdminController],
      providers: [
        {
          provide: ImpersonationService,
          useValue: {
            startImpersonation: jest.fn(),
            endImpersonation: jest.fn(),
            getActiveSessions: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(SuperAdminGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ImpersonationAdminController>(ImpersonationAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

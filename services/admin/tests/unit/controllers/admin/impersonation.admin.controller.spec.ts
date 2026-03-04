import { Test, TestingModule } from '@nestjs/testing';
import { ImpersonationAdminController } from '../../../../src/controllers/admin/impersonation.admin.controller';

describe('ImpersonationAdminController', () => {
  let controller: ImpersonationAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImpersonationAdminController],
      providers: [
        // Add mocked dependencies here
      ],
    }).compile();

    controller = module.get<ImpersonationAdminController>(ImpersonationAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

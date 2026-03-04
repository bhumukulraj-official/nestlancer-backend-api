import { Test, TestingModule } from '@nestjs/testing';
import { DashboardAdminController } from '../../../../src/controllers/admin/dashboard.admin.controller';

describe('DashboardAdminController', () => {
  let controller: DashboardAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardAdminController],
      providers: [
        // Add mocked dependencies here
      ],
    }).compile();

    controller = module.get<DashboardAdminController>(DashboardAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioAdminController } from '../../../../src/controllers/admin/portfolio.admin.controller';

describe('PortfolioAdminController', () => {
  let controller: PortfolioAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PortfolioAdminController],
      providers: [
        // Add mocked dependencies here
      ],
    }).compile();

    controller = module.get<PortfolioAdminController>(PortfolioAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

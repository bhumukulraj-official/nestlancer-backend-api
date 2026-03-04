import { Test, TestingModule } from '@nestjs/testing';
import { SuperAdminGuard } from '../../../src/guards/super-admin.guard';

describe('SuperAdminGuard', () => {
  let provider: SuperAdminGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuperAdminGuard,
        // Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<SuperAdminGuard>(SuperAdminGuard);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

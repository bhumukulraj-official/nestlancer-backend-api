import { Test, TestingModule } from '@nestjs/testing';
import { BackupsAdminController } from '../../../../src/controllers/admin/backups.admin.controller';

describe('BackupsAdminController', () => {
  let controller: BackupsAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BackupsAdminController],
      providers: [
        // Add mocked dependencies here
      ],
    }).compile();

    controller = module.get<BackupsAdminController>(BackupsAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

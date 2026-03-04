import { Test, TestingModule } from '@nestjs/testing';
import { EmailTemplatesAdminController } from '../../../../src/controllers/admin/email-templates.admin.controller';

describe('EmailTemplatesAdminController', () => {
  let controller: EmailTemplatesAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailTemplatesAdminController],
      providers: [
        // Add mocked dependencies here
      ],
    }).compile();

    controller = module.get<EmailTemplatesAdminController>(EmailTemplatesAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

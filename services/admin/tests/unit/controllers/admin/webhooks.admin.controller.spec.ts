import { Test, TestingModule } from '@nestjs/testing';
import { WebhooksAdminController } from '../../../../src/controllers/admin/webhooks.admin.controller';

describe('WebhooksAdminController', () => {
  let controller: WebhooksAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhooksAdminController],
      providers: [
        // Add mocked dependencies here
      ],
    }).compile();

    controller = module.get<WebhooksAdminController>(WebhooksAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

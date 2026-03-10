import { Test, TestingModule } from '@nestjs/testing';
import { WebhooksAdminController } from '../../../../src/controllers/admin/webhooks.admin.controller';
import { WebhooksManagementService } from '../../../../src/services/webhooks-management.service';
import { WebhookDeliveriesService } from '../../../../src/services/webhook-deliveries.service';
import { WebhookTestingService } from '../../../../src/services/webhook-testing.service';
import { JwtAuthGuard, RolesGuard } from '@nestlancer/auth-lib';
import { SuperAdminGuard } from '../../../../src/guards/super-admin.guard';

describe('WebhooksAdminController', () => {
  let controller: WebhooksAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhooksAdminController],
      providers: [
        {
          provide: WebhooksManagementService,
          useValue: {
            findAll: jest.fn(),
            create: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        { provide: WebhookDeliveriesService, useValue: { findAll: jest.fn() } },
        { provide: WebhookTestingService, useValue: { testDelivery: jest.fn() } },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(SuperAdminGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<WebhooksAdminController>(WebhooksAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

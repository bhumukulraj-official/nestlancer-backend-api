import { Test, TestingModule } from '@nestjs/testing';
import { MessagingGateway } from '../../../src/gateways/messaging.gateway';

describe('MessagingGateway', () => {
  let gateway: MessagingGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagingGateway,
        // Add mocked dependencies here
      ],
    }).compile();

    gateway = module.get<MessagingGateway>(MessagingGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});

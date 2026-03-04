import { Test, TestingModule } from '@nestjs/testing';
import { WsPresenceService } from '../../../src/services/presence.service';

describe('WsPresenceService', () => {
  let provider: WsPresenceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WsPresenceService,
        // Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<WsPresenceService>(WsPresenceService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

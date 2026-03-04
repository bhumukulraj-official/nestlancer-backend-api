import { Test, TestingModule } from '@nestjs/testing';
import { WsConnectionService } from '../../../src/services/connection.service';

describe('WsConnectionService', () => {
  let provider: WsConnectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WsConnectionService,
        // Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<WsConnectionService>(WsConnectionService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

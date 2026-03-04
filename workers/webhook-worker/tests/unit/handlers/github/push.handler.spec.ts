import { Test, TestingModule } from '@nestjs/testing';
import { GithubPushHandler } from '../../../../src/handlers/github/push.handler';

describe('GithubPushHandler', () => {
  let provider: GithubPushHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GithubPushHandler,
        // Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<GithubPushHandler>(GithubPushHandler);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

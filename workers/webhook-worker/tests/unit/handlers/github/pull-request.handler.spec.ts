import { Test, TestingModule } from '@nestjs/testing';
import { GithubPullRequestHandler } from '../../../../src/handlers/github/pull-request.handler';

describe('GithubPullRequestHandler', () => {
  let provider: GithubPullRequestHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GithubPullRequestHandler,
        // Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<GithubPullRequestHandler>(GithubPullRequestHandler);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

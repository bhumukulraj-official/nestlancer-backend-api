import { Test, TestingModule } from '@nestjs/testing';
import { GithubDeploymentHandler } from '../../../../src/handlers/github/deployment.handler';

describe('GithubDeploymentHandler', () => {
  let provider: GithubDeploymentHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GithubDeploymentHandler,
        // Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<GithubDeploymentHandler>(GithubDeploymentHandler);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ProjectGateway } from '../../../src/gateways/project.gateway';
import { WsConnectionService } from '../../../src/services/connection.service';
import { WsAuthGuard } from '@nestlancer/websocket';
import { ExecutionContext } from '@nestjs/common';

describe('ProjectGateway', () => {
  let gateway: ProjectGateway;

  beforeEach(async () => {
    const mockConnectionService = {
      addConnection: jest.fn(),
      removeConnection: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectGateway,
        { provide: WsConnectionService, useValue: mockConnectionService },
      ],
    })
      .overrideGuard(WsAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => true,
      })
      .compile();

    gateway = module.get<ProjectGateway>(ProjectGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});

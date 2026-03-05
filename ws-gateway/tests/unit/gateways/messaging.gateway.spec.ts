import { Test, TestingModule } from '@nestjs/testing';
import { MessagingGateway } from '../../../src/gateways/messaging.gateway';
import { WsConnectionService } from '../../../src/services/connection.service';
import { WsPresenceService } from '../../../src/services/presence.service';
import { WsAuthGuard } from '@nestlancer/websocket';
import { ExecutionContext } from '@nestjs/common';

describe('MessagingGateway', () => {
  let gateway: MessagingGateway;

  beforeEach(async () => {
    const mockConnectionService = {
      addConnection: jest.fn(),
      removeConnection: jest.fn(),
      getUserConnections: jest.fn().mockResolvedValue([]),
    };
    const mockPresenceService = {
      setOnline: jest.fn(),
      setOffline: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagingGateway,
        { provide: WsConnectionService, useValue: mockConnectionService },
        { provide: WsPresenceService, useValue: mockPresenceService },
      ],
    })
      .overrideGuard(WsAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => true,
      })
      .compile();

    gateway = module.get<MessagingGateway>(MessagingGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});

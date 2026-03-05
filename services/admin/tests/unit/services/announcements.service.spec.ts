import { Test, TestingModule } from '@nestjs/testing';
import { AnnouncementsService } from '../../../src/services/announcements.service';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { QueuePublisherService } from '@nestlancer/queue';

describe('AnnouncementsService', () => {
  let service: AnnouncementsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnnouncementsService,
        { provide: PrismaWriteService, useValue: { announcement: { create: jest.fn() } } },
        { provide: PrismaReadService, useValue: { announcement: { findMany: jest.fn() } } },
        { provide: QueuePublisherService, useValue: { publish: jest.fn() } },
      ],
    }).compile();

    service = module.get<AnnouncementsService>(AnnouncementsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

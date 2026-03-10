import { Test, TestingModule } from '@nestjs/testing';
import { AuditWriterService } from '../../src/audit-writer.service';
import { AuditRepository } from '../../src/audit.repository';
import { AuditEntry } from '../../src/interfaces/audit-entry.interface';
import { SqsService } from '@nestjs-packages/sqs'; // Added this import

describe('AuditWriterService', () => {
  let service: AuditWriterService;
  let sqsService: SqsService; // Added this line
  let repository: AuditRepository; // Added this line

  const mockRepository = {
    create: jest.fn().mockResolvedValue('audit-id'),
    createBatch: jest.fn().mockResolvedValue(2),
  };

  beforeEach(async () => {
    jest.useFakeTimers();
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuditWriterService, { provide: AuditRepository, useValue: mockRepository }],
    }).compile();

    service = module.get<AuditWriterService>(AuditWriterService);
    repository = module.get<AuditRepository>(AuditRepository);

    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should buffer entries and not flush immediately', async () => {
    const entry: AuditEntry = {
      userId: 'user-1',
      action: 'UPDATE',
      resourceType: 'PROJECT',
      resourceId: 'proj-1',
    };

    await service.write(entry);

    expect(mockRepository.createBatch).not.toHaveBeenCalled();
  });

  it('should flush when batch size is reached', async () => {
    const entry: AuditEntry = {
      userId: 'user-1',
      action: 'UPDATE',
      resourceType: 'PROJECT',
      resourceId: 'proj-1',
    };

    // Default batch size is 50
    for (let i = 0; i < 50; i++) {
      await service.write(entry);
    }

    expect(mockRepository.createBatch).toHaveBeenCalledTimes(1);
    expect(mockRepository.createBatch).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ action: 'UPDATE' })]),
    );
    expect(mockRepository.createBatch.mock.calls[0][0]).toHaveLength(50);
  });

  it('should flush on interval', async () => {
    const entry: AuditEntry = {
      userId: 'user-1',
      action: 'UPDATE',
      resourceType: 'PROJECT',
      resourceId: 'proj-1',
    };

    await service.write(entry);

    // Advance timers by 5 seconds (default flush interval)
    jest.advanceTimersByTime(5000);

    expect(mockRepository.createBatch).toHaveBeenCalledTimes(1);
  });

  it('should write direct without buffering', async () => {
    const entry: AuditEntry = {
      userId: 'user-1',
      action: 'DELETE',
      resourceType: 'USER',
      resourceId: 'user-2',
    };

    const result = await service.writeDirect(entry);

    expect(result).toBe('audit-id');
    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'DELETE',
      }),
    );
  });

  it('should re-add to buffer on flush failure', async () => {
    mockRepository.createBatch.mockRejectedValueOnce(new Error('DB Error'));

    const entry: AuditEntry = {
      userId: 'user-1',
      action: 'UPDATE',
      resourceType: 'PROJECT',
      resourceId: 'proj-1',
    };

    await service.write(entry);
    await service.flush();

    expect(mockRepository.createBatch).toHaveBeenCalled();
    // Buffer should have the entry back (accessing private buffer for test)
    expect((service as any).buffer).toContain(entry);
  });
});

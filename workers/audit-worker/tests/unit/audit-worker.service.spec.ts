import { Test, TestingModule } from '@nestjs/testing';
import { AuditWorkerService } from '../../src/services/audit-worker.service';
import { BatchBufferService } from '../../src/services/batch-buffer.service';
import { AuditBatchInsertProcessor } from '../../src/processors/audit-batch-insert.processor';
import { LoggerService } from '@nestlancer/logger';
import { MetricsService } from '@nestlancer/metrics';
import { ConfigService } from '@nestjs/config';

describe('AuditWorkerService', () => {
    let service: AuditWorkerService;
    let bufferService: BatchBufferService;
    let processor: AuditBatchInsertProcessor;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuditWorkerService,
                {
                    provide: BatchBufferService,
                    useValue: {
                        add: jest.fn(),
                        drain: jest.fn(),
                        size: jest.fn(),
                    },
                },
                {
                    provide: AuditBatchInsertProcessor,
                    useValue: {
                        insertBatch: jest.fn(),
                    },
                },
                {
                    provide: LoggerService,
                    useValue: {
                        log: jest.fn(),
                        debug: jest.fn(),
                        error: jest.fn(),
                        warn: jest.fn(),
                    },
                },
                {
                    provide: MetricsService,
                    useValue: {
                        increment: jest.fn(),
                        gauge: jest.fn(),
                        timing: jest.fn(),
                    },
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn().mockReturnValue(5000),
                    },
                },
            ],
        }).compile();

        service = module.get<AuditWorkerService>(AuditWorkerService);
        bufferService = module.get<BatchBufferService>(BatchBufferService);
        processor = module.get<AuditBatchInsertProcessor>(AuditBatchInsertProcessor);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should add entry to buffer and flush if needed', async () => {
        jest.spyOn(bufferService, 'add').mockReturnValue(true);
        jest.spyOn(bufferService, 'size').mockReturnValue(1);
        jest.spyOn(bufferService, 'drain').mockReturnValue([{ action: 'test' } as any]);

        await service.handleAuditEntry({ action: 'test' } as any);

        expect(bufferService.add).toHaveBeenCalled();
        expect(processor.insertBatch).toHaveBeenCalled();
    });

    it('should not flush if buffer size is 0', async () => {
        jest.spyOn(bufferService, 'size').mockReturnValue(0);

        await service.flush();

        expect(processor.insertBatch).not.toHaveBeenCalled();
    });
});

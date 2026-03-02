import { Test, TestingModule } from '@nestjs/testing';
import { AuditModule } from '../../src/audit.module';
import { AuditWriterService } from '../../src/audit-writer.service';
import { AuditRepository } from '../../src/audit.repository';
import { ConfigModule } from '@nestjs/config';

describe('AuditModule (Integration)', () => {
  let module: TestingModule;
  let service: AuditWriterService;
  let repository: AuditRepository;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env.test' }),
        AuditModule,
      ],
    })
      .overrideProvider(AuditRepository)
      .useValue({
        create: jest.fn().mockResolvedValue('audit-123'),
        createBatch: jest.fn().mockResolvedValue(1),
      })
      .compile();

    service = module.get<AuditWriterService>(AuditWriterService);
    repository = module.get<AuditRepository>(AuditRepository);
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should write audit entry directly', async () => {
    const entry = {
      userId: 'user-1',
      action: 'CREATE',
      resourceType: 'POST',
      resourceId: 'post-1',
      changes: { title: 'New Post' },
    };

    const id = await service.writeDirect(entry as any);

    expect(id).toBe('audit-123');
    expect(repository.create).toHaveBeenCalled();
  });

  it('should buffer and flush entries', async () => {
    const entry = {
      userId: 'user-2',
      action: 'UPDATE',
      resourceType: 'USER',
      resourceId: 'user-2',
    };

    await service.write(entry as any);
    await service.flush();

    expect(repository.createBatch).toHaveBeenCalled();
  });
});

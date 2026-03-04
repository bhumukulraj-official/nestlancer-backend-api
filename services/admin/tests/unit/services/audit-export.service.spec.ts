import { Test, TestingModule } from '@nestjs/testing';
import { AuditExportService } from '../../../src/services/audit-export.service';

describe('AuditExportService', () => {
  let provider: AuditExportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditExportService,
        // Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<AuditExportService>(AuditExportService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

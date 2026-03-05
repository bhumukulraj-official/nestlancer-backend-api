import { Test, TestingModule } from '@nestjs/testing';
import { BackupsAdminController } from '../../../../src/controllers/admin/backups.admin.controller';
import { BackupsService } from '../../../../src/services/backups.service';
import { BackupSchedulerService } from '../../../../src/services/backup-scheduler.service';
import { JwtAuthGuard, RolesGuard } from '@nestlancer/auth-lib';
import { SuperAdminGuard } from '../../../../src/guards/super-admin.guard';

describe('BackupsAdminController', () => {
  let controller: BackupsAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BackupsAdminController],
      providers: [
        {
          provide: BackupsService,
          useValue: {
            findAll: jest.fn(),
            createBackup: jest.fn(),
            findOne: jest.fn(),
            getDownloadUrl: jest.fn(),
            restoreBackup: jest.fn(),
          },
        },
        {
          provide: BackupSchedulerService,
          useValue: {
            getSchedule: jest.fn(),
            updateSchedule: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard).useValue({ canActivate: () => true })
      .overrideGuard(SuperAdminGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<BackupsAdminController>(BackupsAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

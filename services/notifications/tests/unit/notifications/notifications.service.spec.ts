import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from '../../../src/notifications/notifications.service';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';

describe('NotificationsService', () => {
    let service: NotificationsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotificationsService,
                { provide: PrismaWriteService, useValue: {} },
                { provide: PrismaReadService, useValue: {} },
            ],
        }).compile();

        service = module.get<NotificationsService>(NotificationsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});

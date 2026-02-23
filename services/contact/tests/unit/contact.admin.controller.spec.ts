import { Test, TestingModule } from '@nestjs/testing';
import { ContactAdminController } from '../../src/controllers/admin/contact.admin.controller';
import { ContactService } from '../../src/services/contact.service';
import { ContactResponseService } from '../../src/services/contact-response.service';
import { ContactAdminService } from '../../src/services/contact-admin.service';

describe('ContactAdminController', () => {
    let controller: ContactAdminController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ContactAdminController],
            providers: [
                { provide: ContactService, useValue: { findAll: jest.fn().mockResolvedValue({ items: [], totalItems: 0 }), findById: jest.fn() } },
                { provide: ContactResponseService, useValue: { respond: jest.fn() } },
                { provide: ContactAdminService, useValue: { getStatistics: jest.fn().mockResolvedValue({ total: 0 }), markAsSpam: jest.fn() } },
            ],
        }).compile();

        controller = module.get<ContactAdminController>(ContactAdminController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});

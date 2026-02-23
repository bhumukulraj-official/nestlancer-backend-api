import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from '../../../src/storage/storage.service';
import { S3StorageService } from '@nestlancer/storage';

describe('StorageService', () => {
    let service: StorageService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StorageService,
                {
                    provide: S3StorageService,
                    useValue: {
                        getPresignedPutUrl: jest.fn(),
                        getPresignedGetUrl: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<StorageService>(StorageService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});

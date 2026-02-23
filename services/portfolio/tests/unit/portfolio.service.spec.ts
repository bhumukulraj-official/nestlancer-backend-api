import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioService } from '../../src/services/portfolio.service';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';

describe('PortfolioService', () => {
    let service: PortfolioService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PortfolioService,
                {
                    provide: PrismaWriteService,
                    useValue: {
                        portfolioItem: {
                            create: jest.fn(),
                            update: jest.fn(),
                            delete: jest.fn(),
                        },
                    },
                },
                {
                    provide: PrismaReadService,
                    useValue: {
                        portfolioItem: {
                            findMany: jest.fn(),
                            count: jest.fn(),
                            findUnique: jest.fn(),
                            findFirst: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<PortfolioService>(PortfolioService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});

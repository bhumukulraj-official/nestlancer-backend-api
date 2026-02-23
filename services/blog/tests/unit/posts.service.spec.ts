import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from '../../src/services/posts.service';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { ConfigService } from '@nestjs/config';

describe('PostsService', () => {
    let service: PostsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PostsService,
                {
                    provide: PrismaWriteService,
                    useValue: {
                        blogPost: {
                            create: jest.fn(),
                            update: jest.fn(),
                            delete: jest.fn(),
                        },
                    },
                },
                {
                    provide: PrismaReadService,
                    useValue: {
                        blogPost: {
                            findMany: jest.fn(),
                            count: jest.fn(),
                            findUnique: jest.fn(),
                            findFirst: jest.fn(),
                        },
                    },
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn().mockReturnValue(200),
                    },
                }
            ],
        }).compile();

        service = module.get<PostsService>(PostsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});

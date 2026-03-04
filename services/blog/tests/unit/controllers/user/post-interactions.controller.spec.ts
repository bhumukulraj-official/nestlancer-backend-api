import { Test, TestingModule } from '@nestjs/testing';
import { PostInteractionsController } from '../../../../src/controllers/user/post-interactions.controller';
import { PostInteractionsService } from '../../../../src/services/post-interactions.service';

describe('PostInteractionsController', () => {
    let controller: PostInteractionsController;
    let interactionsService: jest.Mocked<PostInteractionsService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PostInteractionsController],
            providers: [
                {
                    provide: PostInteractionsService,
                    useValue: {
                        toggleLike: jest.fn(),
                        addBookmark: jest.fn(),
                        removeBookmark: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<PostInteractionsController>(PostInteractionsController);
        interactionsService = module.get(PostInteractionsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('toggleLike', () => {
        it('should call interactionsService.toggleLike', async () => {
            interactionsService.toggleLike.mockResolvedValue({ liked: true } as any);
            const req = { user: { id: 'user1' } };

            const result = await controller.toggleLike('post-slug', req);

            expect(interactionsService.toggleLike).toHaveBeenCalledWith('post-slug', 'user1');
            expect(result).toEqual({ liked: true });
        });
    });

    describe('addBookmark', () => {
        it('should call interactionsService.addBookmark', async () => {
            interactionsService.addBookmark.mockResolvedValue({ bookmarked: true } as any);
            const req = { user: { id: 'user1' } };

            const result = await controller.addBookmark('post-slug', req);

            expect(interactionsService.addBookmark).toHaveBeenCalledWith('post-slug', 'user1');
            expect(result).toEqual({ bookmarked: true });
        });
    });

    describe('removeBookmark', () => {
        it('should call interactionsService.removeBookmark', async () => {
            interactionsService.removeBookmark.mockResolvedValue({ bookmarked: false } as any);
            const req = { user: { id: 'user1' } };

            const result = await controller.removeBookmark('post-slug', req);

            expect(interactionsService.removeBookmark).toHaveBeenCalledWith('post-slug', 'user1');
            expect(result).toEqual({ bookmarked: false });
        });
    });
});

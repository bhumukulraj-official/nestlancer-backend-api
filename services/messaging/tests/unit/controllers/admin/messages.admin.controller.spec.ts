import { Test, TestingModule } from '@nestjs/testing';
import { MessagesAdminController } from '../../src/controllers/admin/messages.admin.controller';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';

describe('MessagesAdminController', () => {
    let controller: MessagesAdminController;
    let prismaWrite: jest.Mocked<PrismaWriteService>;
    let prismaRead: jest.Mocked<PrismaReadService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MessagesAdminController],
            providers: [
                {
                    provide: PrismaWriteService,
                    useValue: {
                        message: {
                            delete: jest.fn(),
                        },
                    },
                },
                {
                    provide: PrismaReadService,
                    useValue: {
                        message: {
                            findMany: jest.fn(),
                            count: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        controller = module.get<MessagesAdminController>(MessagesAdminController);
        prismaWrite = module.get(PrismaWriteService);
        prismaRead = module.get(PrismaReadService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getAllMessages', () => {
        it('should return paginated messages', async () => {
            const mockMessages = [{ id: '1', content: 'test' }];
            prismaRead.message.findMany.mockResolvedValue(mockMessages as any);
            prismaRead.message.count.mockResolvedValue(1);

            const result = await controller.getAllMessages({ page: '1', limit: '10' });

            expect(prismaRead.message.findMany).toHaveBeenCalledWith({
                skip: 0,
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: { sender: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
            });
            expect(result).toEqual({
                status: 'success',
                items: mockMessages,
                meta: { total: 1, page: 1, limit: 10 },
            });
        });

        it('should use default pagination values', async () => {
            prismaRead.message.findMany.mockResolvedValue([]);
            prismaRead.message.count.mockResolvedValue(0);

            const result = await controller.getAllMessages({});

            expect(prismaRead.message.findMany).toHaveBeenCalledWith(expect.objectContaining({
                skip: 0,
                take: 50,
            }));
            expect(result.meta).toEqual({ total: 0, page: 1, limit: 50 });
        });
    });

    describe('deleteMessage', () => {
        it('should delete message by id', async () => {
            prismaWrite.message.delete.mockResolvedValue({ id: '1' } as any);

            const result = await controller.deleteMessage('1');

            expect(prismaWrite.message.delete).toHaveBeenCalledWith({ where: { id: '1' } });
            expect(result).toEqual({ status: 'success' });
        });
    });
});

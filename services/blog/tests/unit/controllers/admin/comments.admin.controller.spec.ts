import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard, RolesGuard } from '@nestlancer/auth-lib';
import { CommentsAdminController } from '../../../../src/controllers/admin/comments.admin.controller';

describe('CommentsAdminController', () => {
    let controller: CommentsAdminController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CommentsAdminController],
            providers: [
                {
                    provide: Reflector,
                    useValue: {
                        get: jest.fn(),
                        getAllAndOverride: jest.fn(),
                        getAllAndMerge: jest.fn(),
                    },
                },
            ],
        })
            .overrideGuard(JwtAuthGuard).useValue({ canActivate: jest.fn(() => true) })
            .overrideGuard(RolesGuard).useValue({ canActivate: jest.fn(() => true) })
            .compile();

        controller = module.get<CommentsAdminController>(CommentsAdminController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getPending', () => {
        it('should return empty array', () => {
            const result = controller.getPending({});
            expect(result).toEqual([]);
        });
    });

    describe('approve', () => {
        it('should return APPROVED status', () => {
            const result = controller.approve('1');
            expect(result).toEqual({ status: 'APPROVED' });
        });
    });

    describe('reject', () => {
        it('should return REJECTED status', () => {
            const result = controller.reject('1');
            expect(result).toEqual({ status: 'REJECTED' });
        });
    });

    describe('markAsSpam', () => {
        it('should return SPAM status', () => {
            const result = controller.markAsSpam('1');
            expect(result).toEqual({ status: 'SPAM' });
        });
    });
});

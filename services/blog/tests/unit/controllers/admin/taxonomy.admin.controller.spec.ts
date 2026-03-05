import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard, RolesGuard } from '@nestlancer/auth-lib';
import { BlogCategoriesAdminController, BlogTagsAdminController } from '../../../../src/controllers/admin/taxonomy.admin.controller';
import { CategoriesService, TagsService } from '../../../../src/services/taxonomy.service';
import { CreateCategoryDto, UpdateCategoryDto, CreateTagDto, UpdateTagDto, MergeTagsDto } from '../../../../src/dto/create-category.dto';

describe('BlogCategoriesAdminController', () => {
    let controller: BlogCategoriesAdminController;
    let categoriesService: jest.Mocked<CategoriesService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [BlogCategoriesAdminController],
            providers: [
                {
                    provide: Reflector,
                    useValue: {
                        get: jest.fn(),
                        getAllAndOverride: jest.fn(),
                        getAllAndMerge: jest.fn(),
                    },
                },
                {
                    provide: CategoriesService,
                    useValue: {
                        findAll: jest.fn(),
                    },
                },
            ],
        })
            .overrideGuard(JwtAuthGuard).useValue({ canActivate: jest.fn(() => true) })
            .overrideGuard(RolesGuard).useValue({ canActivate: jest.fn(() => true) })
            .compile();

        controller = module.get<BlogCategoriesAdminController>(BlogCategoriesAdminController);
        categoriesService = module.get(CategoriesService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('findAll', () => {
        it('should call categoriesService.findAll', async () => {
            categoriesService.findAll.mockResolvedValue([]);
            await controller.findAll();
            expect(categoriesService.findAll).toHaveBeenCalled();
        });
    });

    describe('create', () => {
        it('should return mock created category', () => {
            const dto = { name: 'Tech' } as CreateCategoryDto;
            const result = controller.create(dto);
            expect(result).toEqual({ id: 'new-category', name: 'Tech' });
        });
    });

    describe('update', () => {
        it('should return mock updated category', () => {
            const dto = { name: 'Tech 2.0' } as UpdateCategoryDto;
            const result = controller.update('1', dto);
            expect(result).toEqual({ id: '1', name: 'Tech 2.0' });
        });
    });

    describe('remove', () => {
        it('should return mock deleted response', () => {
            const result = controller.remove('1');
            expect(result).toEqual({ deleted: true });
        });
    });
});

describe('BlogTagsAdminController', () => {
    let controller: BlogTagsAdminController;
    let tagsService: jest.Mocked<TagsService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [BlogTagsAdminController],
            providers: [
                {
                    provide: Reflector,
                    useValue: {
                        get: jest.fn(),
                        getAllAndOverride: jest.fn(),
                        getAllAndMerge: jest.fn(),
                    },
                },
                {
                    provide: TagsService,
                    useValue: {
                        findAll: jest.fn(),
                    },
                },
            ],
        })
            .overrideGuard(JwtAuthGuard).useValue({ canActivate: jest.fn(() => true) })
            .overrideGuard(RolesGuard).useValue({ canActivate: jest.fn(() => true) })
            .compile();

        controller = module.get<BlogTagsAdminController>(BlogTagsAdminController);
        tagsService = module.get(TagsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('findAll', () => {
        it('should call tagsService.findAll', async () => {
            tagsService.findAll.mockResolvedValue([]);
            await controller.findAll();
            expect(tagsService.findAll).toHaveBeenCalled();
        });
    });

    describe('create', () => {
        it('should return mock created tag', () => {
            const dto = { name: 'nestjs' } as CreateTagDto;
            const result = controller.create(dto);
            expect(result).toEqual({ id: 'new-tag', name: 'nestjs' });
        });
    });

    describe('update', () => {
        it('should return mock updated tag', () => {
            const dto = { name: 'nest' } as UpdateTagDto;
            const result = controller.update('1', dto);
            expect(result).toEqual({ id: '1', name: 'nest' });
        });
    });

    describe('remove', () => {
        it('should return mock deleted response', () => {
            const result = controller.remove('1');
            expect(result).toEqual({ deleted: true });
        });
    });

    describe('merge', () => {
        it('should return mock merge response', () => {
            const dto = { fromTagId: '1', toTagId: '2' } as MergeTagsDto;
            const result = controller.merge(dto);
            expect(result).toEqual({ merged: true, from: '1', to: '2' });
        });
    });
});

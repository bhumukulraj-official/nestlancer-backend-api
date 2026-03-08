import { UserRole } from '@nestlancer/common';
import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { Auth } from '@nestlancer/auth-lib';
import { CategoriesService, TagsService } from '../../services/taxonomy.service';
import { CreateCategoryDto, UpdateCategoryDto, CreateTagDto, UpdateTagDto, MergeTagsDto } from '../../dto/create-category.dto';

@Controller('admin/blog/categories')
@Auth(UserRole.ADMIN)
export class BlogCategoriesAdminController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Get()
    findAll() {
        return this.categoriesService.findAll();
    }

    @Post()
    create(@Body() dto: CreateCategoryDto) {
        return { id: 'new-category', ...dto };
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
        return { id, ...dto };
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return { deleted: true };
    }
}

@Controller('admin/blog/tags')
@Auth(UserRole.ADMIN)
export class BlogTagsAdminController {
    constructor(private readonly tagsService: TagsService) { }

    @Get()
    findAll() {
        return this.tagsService.findAll();
    }

    @Post()
    create(@Body() dto: CreateTagDto) {
        return { id: 'new-tag', ...dto };
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateTagDto) {
        return { id, ...dto };
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return { deleted: true };
    }

    @Post('merge')
    merge(@Body() dto: MergeTagsDto) {
        return { merged: true, from: dto.fromTagId, to: dto.toTagId };
    }
}

@Controller('admin/blog/authors')
@Auth(UserRole.ADMIN)
export class BlogAuthorsAdminController {
    @Get()
    findAll() {
        return { data: [] };
    }
}

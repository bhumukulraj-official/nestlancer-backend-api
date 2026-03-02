import { UserRole } from '@nestlancer/common';
import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { Auth } from '@nestlancer/auth-lib';
import { PortfolioCategoriesService } from '../../services/portfolio-categories.service';
import { CreateCategoryDto } from '../../dto/create-category.dto';
import { UpdateCategoryDto } from '../../dto/update-category.dto';

@Controller('admin/portfolio/categories')
@Auth(UserRole.ADMIN)
export class PortfolioCategoriesAdminController {
    constructor(private readonly categoriesService: PortfolioCategoriesService) { }

    @Get()
    findAll() {
        return this.categoriesService.findAll();
    }

    @Post()
    create(@Body() dto: CreateCategoryDto) {
        return this.categoriesService.create(dto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
        return this.categoriesService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Query('reassignToId') reassignToId?: string) {
        return this.categoriesService.delete(id, reassignToId);
    }
}

import { Controller, Get } from '@nestjs/common';
import { Public } from '@nestlancer/auth-lib';
import { Cacheable } from '@nestlancer/cache';
import { CategoriesService, TagsService, AuthorsService } from '../../services/taxonomy.service';

@Controller('categories')
export class BlogCategoriesPublicController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Public()
    @Get()
    @Cacheable({ ttl: 3600 })
    findAll() {
        return this.categoriesService.findAll();
    }
}

@Controller('tags')
export class BlogTagsPublicController {
    constructor(private readonly tagsService: TagsService) { }

    @Public()
    @Get()
    @Cacheable({ ttl: 3600 })
    findAll() {
        return this.tagsService.findAll();
    }
}

@Controller('authors')
export class AuthorsPublicController {
    constructor(private readonly authorsService: AuthorsService) { }

    @Public()
    @Get()
    @Cacheable({ ttl: 3600 })
    findAll() {
        return this.authorsService.findAll();
    }
}

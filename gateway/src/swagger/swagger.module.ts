import { Module } from '@nestjs/common';
import { DocsSpecsController } from './docs-specs.controller';

@Module({
  controllers: [DocsSpecsController],
})
export class SwaggerDocsModule {}

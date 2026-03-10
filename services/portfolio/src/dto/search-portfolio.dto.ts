import { IsString, IsOptional, IsUUID, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Data Transfer Object for searching portfolio items.
 */
export class SearchPortfolioDto {
  @ApiProperty({ example: 'E-commerce', description: 'Search keywords' })
  @IsString()
  @MinLength(2)
  q: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Limit search to a category',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}

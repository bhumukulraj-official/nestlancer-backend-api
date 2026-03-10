import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

/**
 * Data Transfer Object for basic text-based blog search.
 */
export class SearchPostsDto {
  @ApiProperty({
    example: 'microservices',
    description: 'The search query string (minimum 2 characters)',
  })
  @IsString()
  @MinLength(2)
  q: string;
}

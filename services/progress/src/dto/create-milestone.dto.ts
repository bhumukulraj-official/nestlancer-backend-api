import { IsString, MaxLength, IsOptional, IsDateString, IsArray, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Data Transfer Object for creating a project milestone.
 */
export class CreateMilestoneDto {
  @ApiProperty({
    example: 'Frontend MVP Development',
    maxLength: 200,
    description: 'The name of the milestone',
  })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({
    example: 'Implementation of the core frontend features...',
    description: 'Detailed description of milestone objectives',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2024-02-01', description: 'Expected start date (ISO string)' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2024-02-15', description: 'Expected completion date (ISO string)' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['Homepage UI', 'Auth Flow'],
    description: 'Initial list of deliverable titles',
  })
  @IsOptional()
  @IsArray()
  deliverables?: string[];

  @ApiPropertyOptional({ example: 2, description: 'The sequential order of this milestone' })
  @IsOptional()
  @IsInt()
  order?: number;
}

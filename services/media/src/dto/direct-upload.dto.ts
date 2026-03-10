import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { FileType } from '../interfaces/media.interface';

/**
 * Data Transfer Object for performing a direct file upload.
 */
export class DirectUploadDto {
  @ApiProperty({ enum: FileType, description: 'Broad category of the file' })
  @IsEnum(FileType)
  fileType: FileType;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Associated project ID',
  })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({
    example: '660f9511-f30c-52e5-b827-557766551111',
    description: 'Associated message ID',
  })
  @IsOptional()
  @IsString()
  messageId?: string;
}

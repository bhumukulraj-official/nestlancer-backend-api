import { IsDefined, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for modifying global system configuration parameters.
 */
export class UpdateSystemConfigDto {
    @ApiProperty({ description: 'The unique configuration key to update', example: 'MAX_UPLOAD_SIZE' })
    @IsString()
    key: string;

    @ApiProperty({ description: 'The new value for the configuration key (can be string, number, or boolean)', example: '50MB' })
    @IsDefined()
    value: any;
}


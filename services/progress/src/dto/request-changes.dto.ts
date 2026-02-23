import { IsString, MaxLength, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeRequestDetailDto {
    @ApiProperty({ maxLength: 500 })
    @IsString()
    @MaxLength(500)
    description: string;
}

export class RequestChangesDto {
    @ApiProperty({ maxLength: 2000 })
    @IsString()
    @MaxLength(2000)
    reason: string;

    @ApiProperty({ type: [ChangeRequestDetailDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ChangeRequestDetailDto)
    details: ChangeRequestDetailDto[];
}

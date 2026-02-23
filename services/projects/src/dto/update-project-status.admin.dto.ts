import { IsString, IsNotEmpty, IsBoolean, IsOptional, MaxLength } from 'class-validator';

export class UpdateProjectStatusAdminDto {
    @IsString()
    @IsNotEmpty()
    status: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    reason: string;

    @IsOptional()
    @IsBoolean()
    notifyClient?: boolean;
}

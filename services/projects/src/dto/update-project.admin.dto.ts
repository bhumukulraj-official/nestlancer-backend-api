import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateProjectAdminDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    // More fields could be added as needed based on the Prisma schema for Project
}

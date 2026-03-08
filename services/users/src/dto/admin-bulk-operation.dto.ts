import { IsString, IsArray, IsNotEmpty, IsOptional } from 'class-validator';

export class AdminBulkOperationDto {
    @IsArray()
    @IsString({ each: true })
    userIds: string[];

    @IsString()
    @IsNotEmpty()
    action: string; // 'suspend' | 'activate' | 'delete' | 'resetPassword'

    @IsOptional()
    @IsString()
    reason?: string;
}

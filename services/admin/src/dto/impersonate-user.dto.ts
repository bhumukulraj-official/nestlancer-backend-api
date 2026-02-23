import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ImpersonateUserDto {
    @IsString()
    @MaxLength(500)
    reason: string;

    @IsOptional()
    @IsString()
    ticketId?: string;
}

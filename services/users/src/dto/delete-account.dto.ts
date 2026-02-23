import { IsString, IsOptional, MaxLength } from 'class-validator';

export class DeleteAccountDto {
    @IsString()
    password?: string; // Optional if using OAuth, but required if standard login

    @IsString()
    @MaxLength(50)
    reason: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    feedback?: string;
}

import { IsString, IsNotEmpty, IsIn, Length } from 'class-validator';

export class Verify2FADto {
    @IsString()
    @IsNotEmpty()
    authSessionId: string;

    @IsString()
    @IsNotEmpty()
    @Length(6, 10) // 6 for totp, 10 for backup
    code: string;

    @IsString()
    @IsIn(['totp', 'backupCode'])
    method: 'totp' | 'backupCode';
}

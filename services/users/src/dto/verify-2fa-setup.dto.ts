import { IsString, Length } from 'class-validator';

export class Verify2FASetupDto {
    @IsString()
    @Length(6, 6, { message: 'Code must be exactly 6 digits' })
    code: string;
}

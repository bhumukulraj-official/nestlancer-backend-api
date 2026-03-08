import { IsString, MinLength, Length } from 'class-validator';

export class Disable2FADto {
    @IsString()
    @MinLength(1)
    password: string;

    @IsString()
    @Length(6, 6, { message: 'Code must be exactly 6 digits' })
    code: string;
}

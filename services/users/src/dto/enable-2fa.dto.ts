import { IsString, MinLength } from 'class-validator';

export class Enable2FADto {
    @IsString()
    @MinLength(1)
    password: string;
}

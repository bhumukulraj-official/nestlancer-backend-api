import { IsString, IsNotEmpty } from 'class-validator';

export class AdminChangeRoleDto {
    @IsString()
    @IsNotEmpty()
    role: string;
}

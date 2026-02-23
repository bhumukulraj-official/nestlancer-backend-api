import { IsDefined, IsString } from 'class-validator';

export class UpdateSystemConfigDto {
    @IsString()
    key: string;

    @IsDefined()
    value: any;
}

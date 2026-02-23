import { IsBoolean } from 'class-validator';

export class SubmitRequestDto {
    @IsBoolean()
    confirmComplete: boolean;
}

import { ContactStatus } from '@nestlancer/common';
import { IsEnum } from 'class-validator';

export class UpdateContactStatusDto {
    @IsEnum(ContactStatus)
    status: ContactStatus;
}

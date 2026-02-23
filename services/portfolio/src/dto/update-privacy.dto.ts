import { IsEnum } from 'class-validator';

export enum Visibility {
    PUBLIC = 'PUBLIC',
    UNLISTED = 'UNLISTED',
    PRIVATE = 'PRIVATE',
}

export class UpdatePrivacyDto {
    @IsEnum(Visibility)
    visibility: Visibility;
}

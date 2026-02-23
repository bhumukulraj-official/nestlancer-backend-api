import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PushSubscriptionKeysDto {
    @IsString()
    p256dh: string;

    @IsString()
    auth: string;
}

export class RegisterPushSubscriptionDto {
    @IsString()
    endpoint: string;

    @ValidateNested()
    @Type(() => PushSubscriptionKeysDto)
    keys: PushSubscriptionKeysDto;

    @IsOptional()
    @IsString()
    deviceInfo?: string;
}

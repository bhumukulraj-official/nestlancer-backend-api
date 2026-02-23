import { IsObject, IsBoolean, IsOptional, ValidateNested, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

class EmailNotificationsDto {
    @IsOptional() @IsBoolean() projectUpdates?: boolean;
    @IsOptional() @IsBoolean() paymentReminders?: boolean;
    @IsOptional() @IsBoolean() marketing?: boolean;
    @IsOptional() @IsString() @IsIn(['daily', 'weekly', 'never']) digest?: 'daily' | 'weekly' | 'never';
}

class PushNotificationsDto {
    @IsOptional() @IsBoolean() messages?: boolean;
    @IsOptional() @IsBoolean() projectUpdates?: boolean;
}

class SmsNotificationsDto {
    @IsOptional() @IsBoolean() enabled?: boolean;
}

class NotificationsDto {
    @IsOptional() @ValidateNested() @Type(() => EmailNotificationsDto) email?: EmailNotificationsDto;
    @IsOptional() @ValidateNested() @Type(() => PushNotificationsDto) push?: PushNotificationsDto;
    @IsOptional() @ValidateNested() @Type(() => SmsNotificationsDto) sms?: SmsNotificationsDto;
}

class PrivacyPreferencesDto {
    @IsOptional() @IsString() @IsIn(['public', 'private', 'connections']) profileVisibility?: 'public' | 'private' | 'connections';
    @IsOptional() @IsBoolean() showEmail?: boolean;
    @IsOptional() @IsBoolean() showPhone?: boolean;
}

export class UpdatePreferencesDto {
    @IsOptional()
    @ValidateNested()
    @Type(() => NotificationsDto)
    notifications?: NotificationsDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => PrivacyPreferencesDto)
    privacy?: PrivacyPreferencesDto;
}

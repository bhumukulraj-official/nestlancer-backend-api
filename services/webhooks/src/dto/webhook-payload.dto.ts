import { IsString, IsOptional, IsObject, IsDateString } from 'class-validator';

export class WebhookPayloadDto {
    @IsString()
    provider: string;

    @IsString()
    eventType: string;

    @IsOptional()
    @IsString()
    eventId?: string;

    @IsOptional()
    @IsDateString()
    timestamp?: string;

    @IsObject()
    data: Record<string, any>;
}

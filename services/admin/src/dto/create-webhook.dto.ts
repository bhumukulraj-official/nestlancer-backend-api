import {
    IsArray,
    IsBoolean,
    IsObject,
    IsOptional,
    IsString,
    IsUrl,
    MaxLength,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RetryPolicyDto {
    @IsOptional()
    maxRetries?: number;

    @IsOptional()
    backoffSeconds?: number;
}

export class CreateWebhookDto {
    @IsString()
    @MaxLength(100)
    name: string;

    @IsUrl()
    url: string;

    @IsArray()
    @IsString({ each: true })
    events: string[];

    @IsOptional()
    @IsObject()
    headers?: Record<string, string>;

    @IsOptional()
    @IsString()
    secret?: string;

    @IsOptional()
    @IsBoolean()
    enabled?: boolean;

    @IsOptional()
    @ValidateNested()
    @Type(() => RetryPolicyDto)
    retryPolicy?: RetryPolicyDto;
}

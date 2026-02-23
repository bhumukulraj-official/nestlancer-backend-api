import { IsString, IsArray, IsObject, IsInt, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class RazorpayWebhookDto {
    @IsString()
    entity: string;

    @IsString()
    account_id: string;

    @IsString()
    event: string;

    @IsArray()
    @IsString({ each: true })
    contains: string[];

    @IsObject()
    payload: Record<string, any>;

    @IsInt()
    created_at: number;
}

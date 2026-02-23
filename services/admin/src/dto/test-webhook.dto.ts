import { IsString } from 'class-validator';

export class TestWebhookDto {
    @IsString()
    event: string;
}

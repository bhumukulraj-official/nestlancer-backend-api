export class WebhookResponseDto {
    id: string;
    name: string;
    url: string;
    events: string[];
    enabled: boolean;
    lastDeliveryAt?: Date | null;
    successRate?: number;
    createdAt: Date;
}

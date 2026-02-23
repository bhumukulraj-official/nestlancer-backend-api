export class NotificationResponseDto {
    id: string;
    type: string;
    title: string;
    message: string;
    data: any;
    actionUrl: string;
    readAt: Date | null;
    dismissedAt: Date | null;
    createdAt: Date;
}

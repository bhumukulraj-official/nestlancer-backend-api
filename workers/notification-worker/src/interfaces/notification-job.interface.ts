export enum NotificationChannel {
    IN_APP = 'IN_APP',
    PUSH = 'PUSH',
    SMS = 'SMS',
    EMAIL = 'EMAIL',
}

export enum NotificationJobType {
    IN_APP = 'IN_APP',
    PUSH = 'PUSH',
    SMS = 'SMS',
    REALTIME_FANOUT = 'REALTIME_FANOUT',
    BROADCAST_BATCH = 'BROADCAST_BATCH',
}

export interface NotificationJob {
    type: NotificationJobType;
    userId: string;
    channels?: NotificationChannel[];
    notification: {
        title: string;
        message: string;
        data?: Record<string, any>;
        actionUrl?: string;
    };
    priority?: string;
}

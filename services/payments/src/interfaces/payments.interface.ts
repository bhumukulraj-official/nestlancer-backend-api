export enum PaymentStatus {
    CREATED = 'CREATED',
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED',
}

export interface PaymentIntent {
    id: string;
    projectId: string;
    milestoneId?: string;
    amount: number;
    currency: string;
    clientSecret: string; // Used by frontend, typically order_id for Razorpay
    status: PaymentStatus;
}

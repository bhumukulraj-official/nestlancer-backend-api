import { Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { WebhookHandler } from '../interfaces/webhook-handler.interface';
import { PaymentCapturedHandler } from '../handlers/razorpay/payment-captured.handler';
import { PaymentFailedHandler } from '../handlers/razorpay/payment-failed.handler';
import { RefundProcessedHandler } from '../handlers/razorpay/refund-processed.handler';
import { DisputeCreatedHandler } from '../handlers/razorpay/dispute-created.handler';
import { GithubPushHandler } from '../handlers/github/push.handler';
import { GithubPullRequestHandler } from '../handlers/github/pull-request.handler';
import { GithubDeploymentHandler } from '../handlers/github/deployment.handler';

@Injectable()
export class WebhookWorkerService implements OnModuleInit {
    private handlers: WebhookHandler[] = [];

    constructor(private readonly moduleRef: ModuleRef) { }

    onModuleInit() {
        this.handlers = [
            this.moduleRef.get(PaymentCapturedHandler),
            this.moduleRef.get(PaymentFailedHandler),
            this.moduleRef.get(RefundProcessedHandler),
            this.moduleRef.get(DisputeCreatedHandler),
            this.moduleRef.get(GithubPushHandler),
            this.moduleRef.get(GithubPullRequestHandler),
            this.moduleRef.get(GithubDeploymentHandler),
        ];
    }

    async dispatch(provider: string, eventType: string, payload: any): Promise<void> {
        const handler = this.handlers.find(h => h.canHandle(provider, eventType));
        if (handler) {
            await handler.handle(payload);
        } else {
            throw new Error(`No handler found for provider: ${provider}, eventType: ${eventType}`);
        }
    }
}

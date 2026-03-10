/**
 * E2E MailHog Client
 *
 * Client for the MailHog REST API to assert email delivery in E2E tests.
 * MailHog captures all SMTP emails sent during E2E tests.
 *
 * MailHog API docs: https://github.com/mailhog/MailHog/blob/master/docs/APIv2/swagger-2.0.yaml
 */

import axios, { AxiosInstance } from 'axios';
import { waitFor } from './wait-for';

export interface MailHogMessage {
    ID: string;
    From: { Relays: string[]; Mailbox: string; Domain: string };
    To: Array<{ Relays: string[]; Mailbox: string; Domain: string }>;
    Content: {
        Headers: Record<string, string[]>;
        Body: string;
        Size: number;
    };
    Created: string;
    Raw: { From: string; To: string[]; Data: string };
}

export interface MailHogSearchResult {
    total: number;
    count: number;
    start: number;
    items: MailHogMessage[];
}

export class MailHogClient {
    private client: AxiosInstance;

    constructor(baseUrl?: string) {
        const url = baseUrl || process.env.MAILHOG_URL || 'http://localhost:8025';
        this.client = axios.create({
            baseURL: url,
            timeout: 10000,
        });
    }

    /**
     * Get all messages from MailHog.
     */
    async getMessages(start = 0, limit = 50): Promise<MailHogSearchResult> {
        const response = await this.client.get('/api/v2/messages', {
            params: { start, limit },
        });
        return response.data;
    }

    /**
     * Search emails by recipient address.
     */
    async searchByRecipient(email: string): Promise<MailHogSearchResult> {
        const response = await this.client.get('/api/v2/search', {
            params: { kind: 'to', query: email },
        });
        return response.data;
    }

    /**
     * Search emails by subject containing the given string.
     */
    async searchBySubject(subject: string): Promise<MailHogSearchResult> {
        const response = await this.client.get('/api/v2/search', {
            params: { kind: 'containing', query: subject },
        });
        return response.data;
    }

    /**
     * Delete all messages from MailHog.
     */
    async deleteAll(): Promise<void> {
        await this.client.delete('/api/v1/messages');
    }

    /**
     * Delete a specific message by ID.
     */
    async deleteMessage(messageId: string): Promise<void> {
        await this.client.delete(`/api/v1/messages/${messageId}`);
    }

    /**
     * Wait for an email to arrive for a specific recipient.
     * Polls MailHog until the email appears or timeout is reached.
     */
    async waitForEmail(
        recipientEmail: string,
        options: { timeoutMs?: number; intervalMs?: number } = {},
    ): Promise<MailHogMessage | null> {
        const { timeoutMs = 30000, intervalMs = 1000 } = options;

        const result = await waitFor(
            async () => {
                const searchResult = await this.searchByRecipient(recipientEmail);
                if (searchResult.total > 0) {
                    return searchResult.items[0];
                }
                return null;
            },
            { timeoutMs, intervalMs, description: `email for ${recipientEmail}` },
        );

        return result;
    }

    /**
     * Wait for an email with a specific subject.
     */
    async waitForEmailWithSubject(
        subject: string,
        options: { timeoutMs?: number; intervalMs?: number } = {},
    ): Promise<MailHogMessage | null> {
        const { timeoutMs = 30000, intervalMs = 1000 } = options;

        const result = await waitFor(
            async () => {
                const searchResult = await this.searchBySubject(subject);
                if (searchResult.total > 0) {
                    return searchResult.items[0];
                }
                return null;
            },
            { timeoutMs, intervalMs, description: `email with subject "${subject}"` },
        );

        return result;
    }
}

/**
 * Create a new MailHog client.
 */
export function createMailHogClient(baseUrl?: string): MailHogClient {
    return new MailHogClient(baseUrl);
}

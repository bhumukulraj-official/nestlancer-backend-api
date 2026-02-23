import { Injectable } from '@nestjs/common';
import { PrismaReadService } from '@nestlancer/database/prisma/prisma-read.service';
import { StorageService } from '@nestlancer/storage';

@Injectable()
export class ReceiptPdfService {
    constructor(
        private readonly prismaRead: PrismaReadService,
        private readonly storage: StorageService,
    ) { }

    async generateReceipt(paymentId: string) {
        const payment = await this.prismaRead.payment.findUnique({
            where: { id: paymentId },
        });

        if (!payment) throw new Error('Payment not found');

        // MOCK: Generate PDF buffer using pdfkit or similar
        const fakePdfBuffer = Buffer.from(`Receipt for Payment ID: ${payment.id}, Amount: ${payment.amount}`);

        // Upload to storage
        const key = `receipts/${payment.id}.pdf`;
        await this.storage.upload('pdfs', key, fakePdfBuffer, 'application/pdf');

        return this.storage.getSignedUrl({ bucket: 'pdfs', key });
    }
}

@Injectable()
export class InvoicePdfService {
    constructor(
        private readonly prismaRead: PrismaReadService,
        private readonly storage: StorageService,
    ) { }

    async generateInvoice(paymentId: string) {
        const payment = await this.prismaRead.payment.findUnique({
            where: { id: paymentId },
        });

        if (!payment) throw new Error('Payment not found');

        // MOCK: Generate PDF buffer
        const fakePdfBuffer = Buffer.from(`Invoice for Payment ID: ${payment.id}, Amount: ${payment.amount}`);

        // Upload to storage
        const key = `invoices/${payment.id}.pdf`;
        await this.storage.upload('pdfs', key, fakePdfBuffer, 'application/pdf');

        return this.storage.getSignedUrl({ bucket: 'pdfs', key });
    }
}

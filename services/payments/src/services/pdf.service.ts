import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaReadService } from '@nestlancer/database/prisma/prisma-read.service';
import { PdfService } from '@nestlancer/pdf';
import { StorageService } from '@nestlancer/storage';
import { ConfigService } from '@nestjs/config';

interface PdfResult {
    url: string;
    filename: string;
}

@Injectable()
export class ReceiptPdfService {
    constructor(
        private readonly prismaRead: PrismaReadService,
        private readonly pdfService: PdfService,
        private readonly storage: StorageService,
        private readonly configService: ConfigService,
    ) { }

    async generateReceipt(paymentId: string): Promise<PdfResult> {
        const payment = await this.prismaRead.payment.findUnique({
            where: { id: paymentId },
            include: {
                client: { select: { id: true, name: true, email: true } },
                project: { select: { id: true, title: true } },
                milestone: { select: { id: true, name: true } },
            }
        });

        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        if (!payment.paidAt) {
            throw new NotFoundException('Payment has not been completed yet');
        }

        const companyName = this.configService.get<string>('COMPANY_NAME', 'Nestlancer');
        const companyAddress = this.configService.get<string>('COMPANY_ADDRESS', '');
        const companyGst = this.configService.get<string>('COMPANY_GST', '');

        const pdfResult = await this.pdfService.generate({
            template: 'receipt',
            data: {
                receiptNumber: payment.receiptNumber || `RCP-${payment.id.slice(0, 8).toUpperCase()}`,
                paymentDate: payment.paidAt.toISOString(),
                paymentId: payment.id,
                externalId: payment.externalId,
                amount: payment.amount,
                currency: payment.currency,
                paymentMethod: payment.method || 'Online',
                client: {
                    name: payment.client.name,
                    email: payment.client.email,
                },
                project: {
                    title: payment.project.title,
                    milestone: payment.milestone?.name,
                },
                company: {
                    name: companyName,
                    address: companyAddress,
                    gst: companyGst,
                },
            }
        });

        // Upload to storage
        const key = `receipts/${payment.id}-${Date.now()}.pdf`;
        await this.storage.upload('pdfs', key, pdfResult.buffer, pdfResult.mimeType);

        const url = await this.storage.getSignedUrl({ bucket: 'pdfs', key, expiresIn: 3600 });

        return {
            url,
            filename: pdfResult.filename,
        };
    }
}

@Injectable()
export class InvoicePdfService {
    constructor(
        private readonly prismaRead: PrismaReadService,
        private readonly pdfService: PdfService,
        private readonly storage: StorageService,
        private readonly configService: ConfigService,
    ) { }

    async generateInvoice(paymentId: string): Promise<PdfResult> {
        const payment = await this.prismaRead.payment.findUnique({
            where: { id: paymentId },
            include: {
                client: { select: { id: true, name: true, email: true } },
                project: {
                    select: {
                        id: true,
                        title: true,
                        quote: {
                            select: {
                                id: true,
                                title: true,
                                totalAmount: true,
                                paymentBreakdown: true,
                            }
                        }
                    }
                },
                milestone: { select: { id: true, name: true, amount: true } },
            }
        });

        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        const companyName = this.configService.get<string>('COMPANY_NAME', 'Nestlancer');
        const companyAddress = this.configService.get<string>('COMPANY_ADDRESS', '');
        const companyGst = this.configService.get<string>('COMPANY_GST', '');
        const companySac = this.configService.get<string>('COMPANY_SAC', '998314'); // IT Services SAC code

        const invoiceNumber = payment.invoiceNumber || `INV-${new Date().getFullYear()}-${payment.id.slice(0, 6).toUpperCase()}`;

        // Build line items
        const lineItems = [];
        if (payment.milestone) {
            lineItems.push({
                description: `${payment.project.title} - ${payment.milestone.name}`,
                quantity: 1,
                rate: payment.amount,
                amount: payment.amount,
            });
        } else {
            lineItems.push({
                description: payment.project.title,
                quantity: 1,
                rate: payment.amount,
                amount: payment.amount,
            });
        }

        const subtotal = payment.amount;
        const gstRate = 18; // 18% GST for services in India
        const gstAmount = Math.round(subtotal * gstRate / 100);
        const total = subtotal + gstAmount;

        const pdfResult = await this.pdfService.generate({
            template: 'invoice',
            data: {
                invoiceNumber,
                invoiceDate: new Date().toISOString(),
                dueDate: payment.paidAt ? payment.paidAt.toISOString() : new Date().toISOString(),
                paymentId: payment.id,
                client: {
                    name: payment.client.name,
                    email: payment.client.email,
                },
                project: {
                    id: payment.project.id,
                    title: payment.project.title,
                },
                lineItems,
                subtotal,
                gst: {
                    rate: gstRate,
                    amount: gstAmount,
                    sac: companySac,
                },
                total,
                currency: payment.currency,
                company: {
                    name: companyName,
                    address: companyAddress,
                    gst: companyGst,
                },
                notes: payment.customNotes,
                isPaid: !!payment.paidAt,
                paidAt: payment.paidAt?.toISOString(),
            }
        });

        // Upload to storage
        const key = `invoices/${payment.id}-${Date.now()}.pdf`;
        await this.storage.upload('pdfs', key, pdfResult.buffer, pdfResult.mimeType);

        const url = await this.storage.getSignedUrl({ bucket: 'pdfs', key, expiresIn: 3600 });

        return {
            url,
            filename: pdfResult.filename,
        };
    }
}

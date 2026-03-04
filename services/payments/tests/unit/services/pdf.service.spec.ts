import { Test, TestingModule } from '@nestjs/testing';
import { ReceiptPdfService, InvoicePdfService } from '../../../src/services/pdf.service';
import { PrismaReadService } from '@nestlancer/database';
import { PdfService } from '@nestlancer/pdf';
import { StorageService } from '@nestlancer/storage';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';

describe('PdfService', () => {
    let prismaRead: jest.Mocked<PrismaReadService>;
    let pdfService: jest.Mocked<PdfService>;
    let storageService: jest.Mocked<StorageService>;
    let configService: jest.Mocked<ConfigService>;

    beforeEach(() => {
        prismaRead = {
            payment: { findUnique: jest.fn() },
        } as any;
        pdfService = {
            generate: jest.fn(),
        } as any;
        storageService = {
            upload: jest.fn(),
            getSignedUrl: jest.fn(),
        } as any;
        configService = {
            get: jest.fn().mockImplementation((key, defaultValue) => defaultValue),
        } as any;
    });

    describe('ReceiptPdfService', () => {
        let service: ReceiptPdfService;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    ReceiptPdfService,
                    { provide: PrismaReadService, useValue: prismaRead },
                    { provide: PdfService, useValue: pdfService },
                    { provide: StorageService, useValue: storageService },
                    { provide: ConfigService, useValue: configService },
                ],
            }).compile();
            service = module.get<ReceiptPdfService>(ReceiptPdfService);
        });

        describe('generateReceipt', () => {
            it('should throw NotFoundException if payment not found', async () => {
                prismaRead.payment.findUnique.mockResolvedValue(null);
                await expect(service.generateReceipt('p1')).rejects.toThrow(NotFoundException);
            });

            it('should throw NotFoundException if payment not completed', async () => {
                prismaRead.payment.findUnique.mockResolvedValue({ id: 'p1', paidAt: null } as any);
                await expect(service.generateReceipt('p1')).rejects.toThrow(NotFoundException);
            });

            it('should generate and upload receipt pdf', async () => {
                prismaRead.payment.findUnique.mockResolvedValue({
                    id: 'p1',
                    paidAt: new Date(),
                    amount: 100,
                    currency: 'INR',
                    client: { firstName: 'John', lastName: 'Doe' },
                    project: { title: 'Project 1' },
                    milestone: { name: 'M1' },
                } as any);

                pdfService.generate.mockResolvedValue({ buffer: Buffer.from('pdf'), filename: 'receipt.pdf', mimeType: 'application/pdf' } as any);
                storageService.getSignedUrl.mockResolvedValue('http://url');

                const result = await service.generateReceipt('p1');

                expect(pdfService.generate).toHaveBeenCalledWith(expect.objectContaining({ template: 'receipt' }));
                expect(storageService.upload).toHaveBeenCalledWith('pdfs', expect.stringContaining('receipts/p1'), expect.any(Buffer), 'application/pdf');
                expect(result).toEqual({ url: 'http://url', filename: 'receipt.pdf' });
            });
        });
    });

    describe('InvoicePdfService', () => {
        let service: InvoicePdfService;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    InvoicePdfService,
                    { provide: PrismaReadService, useValue: prismaRead },
                    { provide: PdfService, useValue: pdfService },
                    { provide: StorageService, useValue: storageService },
                    { provide: ConfigService, useValue: configService },
                ],
            }).compile();
            service = module.get<InvoicePdfService>(InvoicePdfService);
        });

        describe('generateInvoice', () => {
            it('should generate and upload invoice pdf', async () => {
                prismaRead.payment.findUnique.mockResolvedValue({
                    id: 'p1',
                    amount: 100,
                    currency: 'INR',
                    paidAt: new Date(),
                    client: { firstName: 'John', lastName: 'Doe' },
                    project: { title: 'Project 1', quote: {} },
                    milestone: { name: 'M1' },
                } as any);

                pdfService.generate.mockResolvedValue({ buffer: Buffer.from('pdf'), filename: 'invoice.pdf', mimeType: 'application/pdf' } as any);
                storageService.getSignedUrl.mockResolvedValue('http://url');

                const result = await service.generateInvoice('p1');

                expect(pdfService.generate).toHaveBeenCalledWith(expect.objectContaining({ template: 'invoice' }));
                expect(storageService.upload).toHaveBeenCalledWith('pdfs', expect.stringContaining('invoices/p1'), expect.any(Buffer), 'application/pdf');
                expect(result).toEqual({ url: 'http://url', filename: 'invoice.pdf' });
            });
        });
    });
});

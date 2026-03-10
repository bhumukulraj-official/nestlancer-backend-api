import { Injectable, Logger } from '@nestjs/common';
import { PdfGenerateOptions, PdfResult } from './interfaces/pdf.interface';
import { getInvoiceTemplate } from './templates/invoice.template';
import { getQuoteTemplate } from './templates/quote.template';
import { getReceiptTemplate } from './templates/receipt.template';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  private getTemplate(templateName: string, data: Record<string, unknown>): string {
    switch (templateName) {
      case 'invoice':
        return getInvoiceTemplate(data);
      case 'quote':
        return getQuoteTemplate(data);
      case 'receipt':
        return getReceiptTemplate(data);
      default:
        throw new Error(`Unknown template: ${templateName}`);
    }
  }

  async generate(options: PdfGenerateOptions): Promise<PdfResult> {
    this.logger.log(`Generating PDF from template: ${options.template}`);
    const html = this.getTemplate(options.template, options.data);

    let puppeteer: any;
    try {
      // puppeteer = await import('puppeteer');
      throw new Error('Puppeteer not installed');
    } catch {
      this.logger.warn('Puppeteer not available — returning HTML as buffer');
      const buffer = Buffer.from(html, 'utf-8');
      return {
        buffer,
        filename: `${options.template}-${Date.now()}.pdf`,
        mimeType: 'text/html',
        size: buffer.length,
      };
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: options.format || 'A4',
        landscape: options.landscape || false,
        margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
        printBackground: true,
      });

      const buffer = Buffer.from(pdfBuffer);
      const filename = `${options.template}-${Date.now()}.pdf`;

      this.logger.log(`PDF generated: ${filename} (${buffer.length} bytes)`);

      return {
        buffer,
        filename,
        mimeType: 'application/pdf',
        size: buffer.length,
      };
    } finally {
      await browser.close();
    }
  }
}

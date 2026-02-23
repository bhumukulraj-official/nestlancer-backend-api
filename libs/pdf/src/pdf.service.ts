import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  async generate(template: string, data: Record<string, unknown>): Promise<Buffer> {
    this.logger.log(`Generating PDF from template: ${template}`);
    // In production: uses puppeteer or pdfmake for PDF generation
    void data;
    return Buffer.from('PDF content placeholder');
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaReadService } from '@nestlancer/database';
import { BusinessLogicException } from '@nestlancer/common';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as handlebars from 'handlebars';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QuotePdfService {
    constructor(
        private readonly prismaRead: PrismaReadService,
        private readonly config: ConfigService,
    ) { }

    async generatePdf(userId: string, quoteId: string) {
        const quote = await this.prismaRead.quote.findFirst({
            where: { id: quoteId, userId },
            include: {
                items: true,
                request: { select: { title: true } },
                user: { select: { firstName: true, lastName: true, email: true } }
            }
        });

        if (!quote) throw new BusinessLogicException('Quote not found', 'QUOTE_001');

        // VERY simplified HTML generation for demo purposes
        const templateHtml = `
      <html>
        <head><style>body { font-family: sans-serif; }</style></head>
        <body>
          <h1>Quote: {{request.title}}</h1>
          <h2>Client: {{user.firstName}} {{user.lastName}}</h2>
          <table border="1" style="width: 100%; border-collapse: collapse;">
            <tr><th>Description</th><th>Qty</th><th>Price</th><th>Total</th></tr>
            {{#each items}}
            <tr>
              <td>{{description}}</td>
              <td>{{quantity}}</td>
              <td>{{unitPrice}}</td>
              <td>{{totalPrice}}</td>
            </tr>
            {{/each}}
          </table>
          <h3>Subtotal: {{subtotal}} {{currency}}</h3>
          <h3>Tax: {{taxAmount}} {{currency}}</h3>
          <h2>Total: {{totalAmount}} {{currency}}</h2>
        </body>
      </html>
    `;

        const template = handlebars.compile(templateHtml);
        const html = template(quote);

        let browser;
        try {
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            await page.setContent(html);
            const pdfBuffer = await page.pdf({ format: 'A4' });
            return pdfBuffer;
        } catch (e: any) {
            console.error('PDF Generation failed', e);
            throw new BusinessLogicException('Failed to generate PDF', 'SYS_001');
        } finally {
            if (browser) await browser.close();
        }
    }
}

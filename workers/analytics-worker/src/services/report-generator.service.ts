import { Injectable } from '@nestjs/common';
import { LoggerService } from '@nestlancer/logger';
import { AnalyticsJobType, Period, ExportFormat } from '../interfaces/analytics-job.interface';
import { StorageService } from '@nestlancer/storage';
import { AnalyticsWorkerService } from './analytics-worker.service';
import PDFDocument from 'pdfkit';

@Injectable()
export class ReportGeneratorService {
  constructor(
    private readonly logger: LoggerService,
    private readonly storageService: StorageService,
    private readonly analyticsWorkerService: AnalyticsWorkerService,
  ) {}

  async generateReport(
    type: AnalyticsJobType,
    period: Period,
    format: ExportFormat,
    data: any,
  ): Promise<string> {
    this.logger.log(`Generating ${format} report for ${type} (${period})`);

    let buffer: Buffer;
    const contentType = format === ExportFormat.PDF ? 'application/pdf' : 'text/csv; charset=utf-8';
    if (format === ExportFormat.PDF) {
      buffer = await this.generatePdfBuffer(type, period, data);
    } else {
      buffer = Buffer.from(this.generateCsv(data), 'utf-8');
    }

    const filename = `report_${type}_${period}_${Date.now()}.${format === ExportFormat.PDF ? 'pdf' : 'csv'}`;
    const result = await this.storageService.upload('reports', filename, buffer, contentType);
    return result.url;
  }

  /**
   * Flattens a nested object into CSV rows (key, value).
   * Dates and objects are stringified for CSV compatibility.
   */
  private generateCsv(data: any): string {
    const rows: Array<[string, string]> = [];
    const push = (prefix: string, value: unknown): void => {
      if (value === null || value === undefined) {
        rows.push([prefix, '']);
        return;
      }
      if (typeof value !== 'object' || value instanceof Date) {
        rows.push([prefix, String(value instanceof Date ? value.toISOString() : value)]);
        return;
      }
      if (Array.isArray(value)) {
        value.forEach((item, i) => push(`${prefix}[${i}]`, item));
        return;
      }
      for (const [k, v] of Object.entries(value)) {
        const key = prefix ? `${prefix}.${k}` : k;
        push(key, v);
      }
    };
    push('', data);
    const escape = (s: string) => {
      if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };
    const header = 'key,value\r\n';
    const body = rows.map(([k, v]) => `${escape(k)},${escape(v)}`).join('\r\n');
    return header + body;
  }

  async generateComprehensiveReport(period: Period): Promise<string> {
    this.logger.log(`Generating comprehensive report for period: ${period}`);

    const projectData = await this.analyticsWorkerService.getLatest(AnalyticsJobType.PROJECT_STATS);
    const userData = await this.analyticsWorkerService.getLatest(AnalyticsJobType.USER_STATS);
    const revenueData = await this.analyticsWorkerService.getLatest(
      AnalyticsJobType.REVENUE_REPORT,
    );

    const comprehensiveData = {
      period,
      generatedAt: new Date(),
      projects: projectData?.data || {},
      users: userData?.data || {},
      revenue: revenueData?.data || {},
    };

    return await this.generateReport(
      AnalyticsJobType.ENGAGEMENT_METRICS,
      period,
      ExportFormat.PDF,
      comprehensiveData,
    );
  }

  private async generatePdfBuffer(
    type: AnalyticsJobType,
    period: Period,
    data: any,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(25).text(`${type} Report - ${period}`, 100, 100);
      doc.fontSize(12).text(JSON.stringify(data, null, 2), 100, 150);
      doc.end();
    });
  }
}

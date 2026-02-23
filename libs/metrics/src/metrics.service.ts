import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);
  private readonly counters = new Map<string, number>();
  private readonly histograms = new Map<string, number[]>();

  incrementCounter(name: string, labels?: Record<string, string>): void {
    const key = `${name}${labels ? JSON.stringify(labels) : ''}`;
    this.counters.set(key, (this.counters.get(key) || 0) + 1);
  }

  observeHistogram(name: string, value: number, labels?: Record<string, string>): void {
    const key = `${name}${labels ? JSON.stringify(labels) : ''}`;
    const values = this.histograms.get(key) || [];
    values.push(value);
    this.histograms.set(key, values);
  }

  setGauge(name: string, value: number, _labels?: Record<string, string>): void {
    this.counters.set(name, value);
  }

  getMetrics(): string {
    let output = '';
    for (const [key, value] of this.counters) { output += `${key} ${value}\n`; }
    return output;
  }
}

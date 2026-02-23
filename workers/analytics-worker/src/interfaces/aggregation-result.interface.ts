import { AnalyticsJobType, Period } from './analytics-job.interface';

export interface AggregationResult {
    type: AnalyticsJobType;
    period: Period;
    data: Record<string, any>;
    generatedAt: Date;
    cachedUntil: Date;
}

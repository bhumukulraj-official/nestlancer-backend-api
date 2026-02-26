import { Injectable, Logger } from '@nestjs/common';
import { SearchOptions, SearchResult } from './interfaces/search.interface';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  async search<T>(index: string, options: SearchOptions): Promise<SearchResult<T>> {
    this.logger.debug(`Searching ${index}: ${options.query}`);
    // In production: delegates to Meilisearch
    return { hits: [], totalHits: 0, processingTimeMs: 0, page: options.page || 1, limit: options.limit || 20 };
  }
}

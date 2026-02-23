import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SearchIndexerService {
  private readonly logger = new Logger(SearchIndexerService.name);
  async index(indexName: string, id: string, document: Record<string, unknown>): Promise<void> {
    this.logger.debug(`Indexing ${indexName}:${id}`);
    void document;
  }
  async remove(indexName: string, id: string): Promise<void> {
    this.logger.debug(`Removing from index ${indexName}:${id}`);
  }
}

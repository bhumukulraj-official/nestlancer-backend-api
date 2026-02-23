import { Module, Global } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchIndexerService } from './search-indexer.service';
@Global()
@Module({ providers: [SearchService, SearchIndexerService], exports: [SearchService, SearchIndexerService] })
export class SearchModule {}

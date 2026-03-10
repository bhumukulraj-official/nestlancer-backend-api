import { Injectable } from '@nestjs/common';

@Injectable()
export class FeedService {
  async generateRss() {
    return '<rss></rss>';
  }

  async generateAtom() {
    return '<feed></feed>';
  }
}

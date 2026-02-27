import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HttpProxyService } from './http-proxy.service';

/**
 * Proxy Module
 * Provides HTTP proxy functionality for routing requests to microservices
 */
@Global()
@Module({
  imports: [
    HttpModule.register({
      // Global axios defaults
      maxRedirects: 5,
      // Don't throw on error status codes - we'll handle them
      validateStatus: () => true,
    }),
  ],
  providers: [HttpProxyService],
  exports: [HttpProxyService],
})
export class ProxyModule {}

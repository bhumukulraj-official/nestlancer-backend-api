import { Module, DynamicModule, Global } from '@nestjs/common';
import { MailService } from './mail.service';

@Global()
@Module({})
export class MailModule {
  static forRoot(options?: { provider?: string }): DynamicModule {
    return { module: MailModule, providers: [{ provide: 'MAIL_OPTIONS', useValue: options || {} }, MailService], exports: [MailService] };
  }
}

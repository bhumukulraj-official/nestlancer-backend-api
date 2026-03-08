import { Controller, Get } from '@nestjs/common';
import { Public } from '@nestlancer/common';

@Controller('webhooks')
export class WebhooksHealthController {
    @Public()
    @Get('health')
    health() {
        return { status: 'ok', service: 'webhooks-inbound' };
    }
}

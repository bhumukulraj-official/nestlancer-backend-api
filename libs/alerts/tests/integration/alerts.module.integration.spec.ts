import { Test, TestingModule } from '@nestjs/testing';
import { AlertsModule } from '../../src/alerts.module';
import { AlertsService } from '../../src/alerts.service';
import { SlackChannel } from '../../src/channels/slack.channel';
import { PagerdutyChannel } from '../../src/channels/pagerduty.channel';
import { EmailAlertChannel } from '../../src/channels/email-alert.channel';
import { ConfigModule } from '@nestjs/config';

describe('AlertsModule (Integration)', () => {
  let module: TestingModule;
  let service: AlertsService;
  let slackChannel: SlackChannel;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env.test' }), AlertsModule],
    })
      .overrideProvider(SlackChannel)
      .useValue({ send: jest.fn().mockResolvedValue(undefined) })
      .overrideProvider(PagerdutyChannel)
      .useValue({ send: jest.fn().mockResolvedValue(undefined) })
      .overrideProvider(EmailAlertChannel)
      .useValue({ send: jest.fn().mockResolvedValue(undefined) })
      .compile();

    service = module.get<AlertsService>(AlertsService);
    slackChannel = module.get<SlackChannel>(SlackChannel);
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send alert to correct channels based on rules', async () => {
    const alert = {
      title: 'Database Connection Error',
      message: 'Failed to connect to primary node',
      severity: 'critical',
      source: 'database-server',
    };

    await service.sendAlert(alert as any);

    // Verify slack was called (default rule for critical/db usually includes slack)
    expect(slackChannel.send).toHaveBeenCalled();
  });
});

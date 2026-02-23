import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestlancer/config';
import { LoggerModule } from '@nestlancer/logger';
import { MetricsModule } from '@nestlancer/metrics';
import { TracingModule } from '@nestlancer/tracing';
import { DatabaseModule } from '@nestlancer/database';
import { QueueModule } from '@nestlancer/queue';
import { OutboxModule } from '@nestlancer/outbox';
import { CacheModule } from '@nestlancer/cache';
import { AuthLibModule } from '@nestlancer/auth-lib';
import { IdempotencyModule } from '@nestlancer/idempotency';
import { JwtModule } from '@nestjs/jwt';

import authConfig from './config/auth.config';
import { AuthPublicController } from './controllers/auth.public.controller';
import { AuthService } from './services/auth.service';
import { RegistrationService } from './services/registration.service';
import { LoginService } from './services/login.service';
import { TokenService } from './services/token.service';
import { PasswordService } from './services/password.service';
import { TwoFactorService } from './services/two-factor.service';
import { EmailVerificationService } from './services/email-verification.service';
import { AccountLockoutService } from './services/account-lockout.service';
import { TurnstileService } from './services/turnstile.service';
import { TurnstileGuard } from './guards/turnstile.guard';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [authConfig],
        }),
        LoggerModule.forRoot(),
        MetricsModule.forRoot(),
        TracingModule.forRoot(),
        DatabaseModule,
        QueueModule,
        OutboxModule,
        CacheModule,
        AuthLibModule,
        IdempotencyModule,
        JwtModule.register({}),
    ],
    controllers: [AuthPublicController],
    providers: [
        AuthService,
        RegistrationService,
        LoginService,
        TokenService,
        PasswordService,
        TwoFactorService,
        EmailVerificationService,
        AccountLockoutService,
        TurnstileService,
        TurnstileGuard,
    ],
    exports: [TurnstileService],
})
export class AppModule { }

import { Injectable } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { LoginService } from './login.service';
import { TokenService } from './token.service';
import { PasswordService } from './password.service';
import { TwoFactorService } from './two-factor.service';
import { EmailVerificationService } from './email-verification.service';
import { TurnstileService } from './turnstile.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { Verify2FADto } from '../dto/verify-2fa.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { RefreshTokenDto } from '../dto/refresh.dto';
import { ResendVerificationDto } from '../dto/resend-verification.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly registrationService: RegistrationService,
        private readonly loginService: LoginService,
        private readonly tokenService: TokenService,
        private readonly passwordService: PasswordService,
        private readonly twoFactorService: TwoFactorService,
        private readonly emailService: EmailVerificationService,
        private readonly turnstileService: TurnstileService,
    ) { }

    async register(dto: RegisterDto, ipAddress: string) {
        await this.turnstileService.verifyToken(dto.turnstileToken, ipAddress);
        return this.registrationService.registerUser(dto);
    }

    async login(dto: LoginDto, ipAddress: string, userAgent: string) {
        // Turnstile check could be injected conditionally here via guard or service if > 3 failed requests detected.  
        return this.loginService.authenticate(dto, ipAddress, userAgent);
    }

    async refresh(dto: RefreshTokenDto, ipAddress: string, userAgent: string) {
        return this.tokenService.refreshToken(dto.refreshToken, ipAddress, userAgent);
    }

    async verify2FA(dto: Verify2FADto) {
        return this.twoFactorService.verify2FA(dto.authSessionId, dto.code, dto.method);
    }

    async checkEmail(email: string, turnstileToken: string, ipAddress: string) {
        await this.turnstileService.verifyToken(turnstileToken, ipAddress);
        const valid = await this.registrationService.checkEmail(email);
        return { valid: !valid }; // valid implies it CAN be registered (not taken)
    }

    async verifyEmail(dto: VerifyEmailDto) {
        return this.emailService.verifyEmail(dto.token);
    }

    async resendVerification(dto: ResendVerificationDto) {
        return this.emailService.resendVerification(dto.email);
    }

    async forgotPassword(dto: ForgotPasswordDto, ipAddress: string) {
        await this.turnstileService.verifyToken(dto.turnstileToken, ipAddress);
        return this.passwordService.requestPasswordReset(dto.email);
    }

    async resetPassword(dto: ResetPasswordDto) {
        return this.passwordService.resetPassword(dto.token, dto.newPassword);
    }
}

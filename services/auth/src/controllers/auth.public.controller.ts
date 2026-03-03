import { Controller, Post, Get, Body, Query, Headers, Ip, Res, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { ApiStandardResponse, Public } from '@nestlancer/common';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { Verify2FADto } from '../dto/verify-2fa.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { RefreshTokenDto } from '../dto/refresh.dto';
import { ResendVerificationDto } from '../dto/resend-verification.dto';


@Controller()
@Public() // Most routes in this controller do not require standard JWT access token yet
export class AuthPublicController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @ApiStandardResponse({ message: 'Account created successfully. Please verify your email.' })
    async register(
        @Body() dto: RegisterDto,
        @Ip() ipAddress: string,
        @Res({ passthrough: true }) res: Response
    ) {
        const result = await this.authService.register(dto, ipAddress);
        res.status(HttpStatus.CREATED);
        return {
            userId: result.user.id,
            email: result.user.email,
            emailVerificationSent: true,
            emailVerificationExpiresAt: result.user.verificationTokens[0].expiresAt,
        };
    }

    @Post('login')
    async login(
        @Body() dto: LoginDto,
        @Ip() ipAddress: string,
        @Headers('user-agent') userAgent: string,
        @Res() res: Response
    ) {
        const result = await this.authService.login(dto, ipAddress, userAgent);

        if ('requires2FA' in result) {
            return res.status(HttpStatus.ACCEPTED).json({
                status: 'partial',
                message: 'Two-factor authentication required',
                data: result
            });
        }

        return res.status(HttpStatus.OK).json({
            status: 'success',
            data: result
        });
    }

    @Post('refresh')
    @ApiStandardResponse()
    async refresh(
        @Body() dto: RefreshTokenDto,
        @Ip() ipAddress: string,
        @Headers('user-agent') userAgent: string
    ) {
        return this.authService.refresh(dto, ipAddress, userAgent);
    }

    @Post('verify-2fa')
    @ApiStandardResponse()
    async verify2fa(@Body() dto: Verify2FADto) {
        return this.authService.verify2FA(dto);
    }

    @Post('verify-email')
    @ApiStandardResponse({ message: 'Email verified successfully' })
    async verifyEmail(@Body() dto: VerifyEmailDto) {
        return this.authService.verifyEmail(dto);
    }

    @Post('resend-verification')
    @ApiStandardResponse({ message: 'If your account requires verification, a new email has been sent.' })
    async resendVerification(@Body() dto: ResendVerificationDto) {
        await this.authService.resendVerification(dto);
        return { emailSent: true };
    }

    @Post('forgot-password')
    @ApiStandardResponse({ message: 'If an account exists with this email, you will receive password reset instructions' })
    async forgotPassword(
        @Body() dto: ForgotPasswordDto,
        @Ip() ipAddress: string
    ) {
        await this.authService.forgotPassword(dto, ipAddress);
        return { emailSent: true };
    }

    @Post('reset-password')
    @ApiStandardResponse({ message: 'Password reset successfully' })
    async resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto);
    }

    @Get('check-email')
    @ApiStandardResponse()
    async checkEmail(
        @Query('email') email: string,
        @Query('turnstileToken') token: string,
        @Ip() ipAddress: string
    ) {
        return this.authService.checkEmail(email, token, ipAddress);
    }

    @Get('health')
    @ApiStandardResponse()
    healthCheck() {
        return { status: 'ok', service: 'auth' };
    }
}

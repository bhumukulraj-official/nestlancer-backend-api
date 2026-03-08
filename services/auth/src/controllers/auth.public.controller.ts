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


import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiProperty } from '@nestjs/swagger';

/**
 * Controller for public-facing authentication and account management operations.
 * Handles user registration, login, token refresh, and password recovery flows.
 * 
 * @category Authentication
 */
@ApiTags('Authentication')
@Controller()
@Public() // Most routes in this controller do not require standard JWT access token yet
export class AuthPublicController {
    constructor(private readonly authService: AuthService) { }

    /**
     * Registers a new user account in the system.
     * 
     * @param dto User registration details (email, password, etc.)
     * @param ipAddress The IP address of the registration request
     * @param res Express response object for setting status
     * @returns Basic user info and verification status
     */
    @Post('register')
    @ApiOperation({ summary: 'Register new account', description: 'Create a new user account and trigger an email verification process.' })
    @ApiStandardResponse({ message: 'Account created successfully. Please verify your email.' })
    async register(
        @Body() dto: RegisterDto,
        @Ip() ipAddress: string,
        @Res({ passthrough: true }) res: Response
    ): Promise<any> {
        const result = await this.authService.register(dto, ipAddress);
        res.status(HttpStatus.CREATED);
        return {
            userId: result.user.id,
            email: result.user.email,
            emailVerificationSent: true,
            emailVerificationExpiresAt: result.user.verificationTokens[0].expiresAt,
        };
    }

    /**
     * Authenticates a user with email and password.
     * May return a full session or a requirement for 2FA.
     * 
     * @param dto Login credentials
     * @param ipAddress The IP address of the login attempt
     * @param userAgent The user agent of the client
     * @param res Express response object for manual status management
     * @returns JWT tokens or 2FA challenge status
     */
    @Post('login')
    @ApiOperation({ summary: 'User login', description: 'Authenticate with credentials to obtain a session or trigger 2FA if enabled.' })
    async login(
        @Body() dto: LoginDto,
        @Ip() ipAddress: string,
        @Headers('user-agent') userAgent: string,
        @Res() res: Response
    ): Promise<any> {
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

    /**
     * Exchanges a valid refresh token for a new set of access and refresh tokens.
     * 
     * @param dto The refresh token payload
     * @param ipAddress The IP address of the refresh request
     * @param userAgent The user agent of the client
     * @returns New JWT token pair
     */
    @Post('refresh')
    @ApiOperation({ summary: 'Refresh access token', description: 'Obtain new access and refresh tokens using a valid refresh token.' })
    @ApiStandardResponse()
    async refresh(
        @Body() dto: RefreshTokenDto,
        @Ip() ipAddress: string,
        @Headers('user-agent') userAgent: string
    ): Promise<any> {
        return this.authService.refresh(dto, ipAddress, userAgent);
    }

    /**
     * Verifies a two-factor authentication (2FA) code.
     * 
     * @param dto The 2FA verification token and code
     * @returns JWT session tokens upon successful verification
     */
    @Post('verify-2fa')
    @ApiOperation({ summary: 'Verify 2FA code', description: 'Complete the login process by providing a valid 2FA code (TOTP or Backup).' })
    @ApiStandardResponse()
    async verify2fa(@Body() dto: Verify2FADto): Promise<any> {
        return this.authService.verify2FA(dto);
    }

    /**
     * Verifies a user's email address using a token.
     * 
     * @param dto The email verification token
     * @returns Confirmation of email verification
     */
    @Post('verify-email')
    @ApiOperation({ summary: 'Verify email address', description: 'Confirm ownership of an email address using a token sent during registration or update.' })
    @ApiStandardResponse({ message: 'Email verified successfully' })
    async verifyEmail(@Body() dto: VerifyEmailDto): Promise<any> {
        return this.authService.verifyEmail(dto);
    }

    /**
     * Resends the email verification link to a user.
     * 
     * @param dto User identifier for resending verification
     * @returns Success confirmation
     */
    @Post('resend-verification')
    @ApiOperation({ summary: 'Resend verification email', description: 'Request a new email verification link if the previous one expired or was lost.' })
    @ApiStandardResponse({ message: 'If your account requires verification, a new email has been sent.' })
    async resendVerification(@Body() dto: ResendVerificationDto): Promise<any> {
        await this.authService.resendVerification(dto);
        return { emailSent: true };
    }

    /**
     * Initiates the password recovery process.
     * 
     * @param dto The email address of the account to recover
     * @param ipAddress The IP address of the request
     * @returns Success confirmation (regardless of account existence for security)
     */
    @Post('forgot-password')
    @ApiOperation({ summary: 'Forgot password', description: 'Send password reset instructions to the provided email address if an account exists.' })
    @ApiStandardResponse({ message: 'If an account exists with this email, you will receive password reset instructions' })
    async forgotPassword(
        @Body() dto: ForgotPasswordDto,
        @Ip() ipAddress: string
    ): Promise<any> {
        await this.authService.forgotPassword(dto, ipAddress);
        return { emailSent: true };
    }

    /**
     * Resets a user's password using a valid recovery token.
     * 
     * @param dto The reset token and new password
     * @returns Confirmation of password reset
     */
    @Post('reset-password')
    @ApiOperation({ summary: 'Reset password', description: 'Set a new password for an account using a valid password recovery token.' })
    @ApiStandardResponse({ message: 'Password reset successfully' })
    async resetPassword(@Body() dto: ResetPasswordDto): Promise<any> {
        return this.authService.resetPassword(dto);
    }

    /**
     * Checks if an email address is already registered.
     * 
     * @param email The email address to check
     * @param token Turnstile verification token
     * @param ipAddress The IP address of the request
     * @returns Availability status
     */
    @Get('check-email')
    @ApiOperation({ summary: 'Check email availability', description: 'Verify if an email address is available or already in use on the platform.' })
    @ApiStandardResponse()
    async checkEmail(
        @Query('email') email: string,
        @Query('turnstileToken') token: string,
        @Ip() ipAddress: string
    ): Promise<any> {
        return this.authService.checkEmail(email, token, ipAddress);
    }

    /**
     * Connectivity and health check for the authentication service.
     * 
     * @returns Basic status information
     */
    @Get('health')
    @ApiOperation({ summary: 'Service health check', description: 'Verify that the authentication microservice is online and operational.' })
    @ApiStandardResponse()
    async healthCheck(): Promise<any> {
        return { status: 'ok', service: 'auth' };
    }
}


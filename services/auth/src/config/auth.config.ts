import { registerAs } from '@nestjs/config';

export default registerAs('authService', () => ({
    jwt: {
        accessPublicKey: process.env.JWT_ACCESS_PUBLIC_KEY,
        accessPrivateKey: process.env.JWT_ACCESS_PRIVATE_KEY,
        accessExpiresIn: parseInt(process.env.JWT_ACCESS_EXPIRES_IN || '900', 10), // 15 mins
        refreshPublicKey: process.env.JWT_REFRESH_PUBLIC_KEY,
        refreshPrivateKey: process.env.JWT_REFRESH_PRIVATE_KEY,
        refreshExpiresIn: parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '604800', 10), // 7 days
        issuer: process.env.JWT_ISSUER || 'nestlancer-auth',
        audience: process.env.JWT_AUDIENCE || 'nestlancer-api',
    },
    security: {
        bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
        maxFailedAttempts: parseInt(process.env.MAX_FAILED_LOGIN_ATTEMPTS || '5', 10),
        lockoutDurationMs: parseInt(process.env.LOCKOUT_DURATION_MS || '1800000', 10), // 30 mins
        failedLoginCooldownWindowMs: parseInt(process.env.FAILED_LOGIN_COOLDOWN_WINDOW_MS || '3600000', 10), // 1 hour
        otpExpiresInMs: parseInt(process.env.OTP_EXPIRES_IN_MS || '300000', 10), // 5 mins
    },
    turnstile: {
        secretKey: process.env.TURNSTILE_SECRET_KEY,
        bypassToken: process.env.TURNSTILE_BYPASS_TOKEN, // For local dev testing
    },
    tokens: {
        emailVerificationExpiresIn: parseInt(process.env.EMAIL_VERIFY_EXPIRES_IN || '86400', 10), // 24 hours
        passwordResetExpiresIn: parseInt(process.env.PASSWORD_RESET_EXPIRES_IN || '3600', 10), // 1 hour
    }
}));

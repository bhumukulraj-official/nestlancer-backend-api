# Nestlancer Auth Service

Handles user authentication, registration, email verification, password management, and two-factor authentication.

## Service Features

- JWT Auth (RS256)
- Refresh token rotation
- Device/IP tracking & lockout
- 2FA (TOTP / Backup codes)
- CSRF protection

## Commands

```bash
# Start locally
pnpm run start:dev

# Run tests
pnpm test
```

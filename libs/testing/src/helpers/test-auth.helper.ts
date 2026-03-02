import * as jwt from 'jsonwebtoken';

const DEFAULT_SECRET = process.env.JWT_ACCESS_SECRET || 'test-secret-key-for-testing-only-32char';

export interface TestJwtPayload {
  sub: string;
  email?: string;
  role?: string;
  permissions?: string[];
}

/**
 * Create a test JWT access token.
 */
export function createTestJwt(
  payload: TestJwtPayload,
  options?: { secret?: string; expiresIn?: string },
): string {
  const secret = options?.secret || DEFAULT_SECRET;
  const expiresIn = options?.expiresIn || '1h';

  return jwt.sign(
    {
      sub: payload.sub,
      email: payload.email || `${payload.sub}@test.com`,
      role: payload.role || 'USER',
      permissions: payload.permissions || [],
      iat: Math.floor(Date.now() / 1000),
    },
    secret,
    { expiresIn: expiresIn as any },
  );
}

/**
 * Create a test JWT refresh token.
 */
export function createTestRefreshToken(
  userId: string,
  options?: { secret?: string; expiresIn?: string },
): string {
  const secret = options?.secret || (process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-32char-min-test');

  return jwt.sign(
    { sub: userId, type: 'refresh' },
    secret,
    { expiresIn: (options?.expiresIn || '30d') as any },
  );
}

/**
 * Create an authorization header value for testing.
 */
export function createAuthHeader(payload: TestJwtPayload): string {
  return `Bearer ${createTestJwt(payload)}`;
}

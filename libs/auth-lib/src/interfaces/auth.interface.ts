export interface JwtPayload { sub: string; email: string; role: string; type?: string; jti?: string; iat?: number; exp?: number; }
export interface AuthenticatedUser { userId: string; email: string; role: string; iat: number; exp: number; }
export interface TokenPair { accessToken: string; refreshToken: string; expiresIn: number; }

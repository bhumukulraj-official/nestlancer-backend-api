export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  type?: string;
  jti?: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  userId: string;
  sub?: string; // Alias for userId (JWT standard claim)
  email: string;
  role: string;
  jti?: string;
  iat: number;
  exp: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

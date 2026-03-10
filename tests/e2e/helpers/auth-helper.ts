/**
 * E2E Auth Helper
 *
 * Utilities for user registration, login, and JWT token management
 * in E2E tests. All auth flows go through the API Gateway.
 */

import { E2EHttpClient, createHttpClient } from './http-client';

export interface RegisterPayload {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    acceptTerms: boolean;
    turnstileToken?: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface AuthenticatedUser {
    tokens: AuthTokens;
    user: {
        id: string;
        email: string;
        role: string;
    };
}

const DEFAULT_PASSWORD = 'E2eTest!Pass123';

/**
 * Register a new user via the auth service.
 */
export async function registerUser(
    client: E2EHttpClient,
    payload?: Partial<RegisterPayload>,
): Promise<any> {
    const uniqueSuffix = Date.now() + Math.random().toString(36).substring(7);
    const data: RegisterPayload = {
        email: payload?.email || `e2e-user-${uniqueSuffix}@test.com`,
        password: payload?.password || DEFAULT_PASSWORD,
        firstName: payload?.firstName || 'E2E',
        lastName: payload?.lastName || 'TestUser',
        acceptTerms: payload?.acceptTerms ?? true,
        turnstileToken: payload?.turnstileToken || process.env.TURNSTILE_BYPASS_TOKEN || 'e2e-bypass-token',
    };

    const response = await client.post('/auth/register', data);
    return response;
}

/**
 * Login a user via the auth service.
 */
export async function loginUser(
    client: E2EHttpClient,
    payload?: Partial<LoginPayload>,
): Promise<any> {
    const data: LoginPayload = {
        email: payload?.email || 'e2e-user@test.com',
        password: payload?.password || DEFAULT_PASSWORD,
    };

    const response = await client.post('/auth/login', data);
    return response;
}

/**
 * Refresh an access token using a refresh token.
 */
export async function refreshToken(
    client: E2EHttpClient,
    refreshTokenValue: string,
): Promise<any> {
    const response = await client.post('/auth/refresh', {
        refreshToken: refreshTokenValue,
    });
    return response;
}

/**
 * Register a new user and immediately log in to get tokens.
 * Returns the authenticated user info with tokens.
 */
export async function registerAndLogin(
    client?: E2EHttpClient,
    overrides?: Partial<RegisterPayload>,
): Promise<{ client: E2EHttpClient; response: any; email: string; password: string }> {
    const httpClient = client || createHttpClient();
    const uniqueSuffix = Date.now() + Math.random().toString(36).substring(7);
    const email = overrides?.email || `e2e-user-${uniqueSuffix}@test.com`;
    const password = overrides?.password || DEFAULT_PASSWORD;

    // Register
    await registerUser(httpClient, { ...overrides, email, password });

    // Login
    const loginResponse = await loginUser(httpClient, { email, password });

    // Set auth token on client if login was successful
    if (loginResponse.status === 200 || loginResponse.status === 201) {
        const accessToken = loginResponse.data?.data?.accessToken || loginResponse.data?.accessToken;
        if (accessToken) {
            httpClient.setAuthToken(accessToken);
        }
    }

    return { client: httpClient, response: loginResponse, email, password };
}

/**
 * Create an auth header object for use with test requests.
 * Uses createTestJwt from @nestlancer/testing for fast JWT generation
 * (bypasses the auth service).
 */
export function createTestAuthHeaders(
    userId: string,
    role: string = 'USER',
): Record<string, string> {
    // Import dynamically to avoid requiring jsonwebtoken at module level
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const jwt = require('jsonwebtoken');
    const secret = process.env.JWT_ACCESS_SECRET || 'test-secret-key-for-testing-only-32char';

    const token = jwt.sign(
        {
            sub: userId,
            email: `${userId}@test.com`,
            role,
            permissions: [],
            iat: Math.floor(Date.now() / 1000),
        },
        secret,
        { expiresIn: '1h' },
    );

    return { Authorization: `Bearer ${token}` };
}

/**
 * Create admin auth headers.
 */
export function createAdminAuthHeaders(): Record<string, string> {
    return createTestAuthHeaders('e2e-admin', 'ADMIN');
}

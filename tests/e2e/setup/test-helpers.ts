/**
 * E2E Test Helpers
 *
 * Provides reusable HTTP client wrappers and assertion utilities
 * for all E2E test suites. All requests go through the API Gateway.
 *
 * NOTE: We extract only serializable fields from axios responses
 * to avoid Jest "circular structure" serialization errors.
 */

import axios, { AxiosRequestConfig } from 'axios';
import { API_BASE, ADMIN_USER, CLIENT_USER } from './seed-data';

// ─── Serializable Response Type ─────────────────────────────────────────────
export interface ApiResponse {
    status: number;
    data: any;
    headers: Record<string, string>;
}

// ─── Shared State ───────────────────────────────────────────────────────────
let adminToken: string | null = null;
let clientToken: string | null = null;

/**
 * Strip circular refs from an axios response to make it Jest-safe.
 */
function toApiResponse(axiosRes: any): ApiResponse {
    return {
        status: axiosRes.status,
        data: axiosRes.data,
        headers: axiosRes.headers ? { ...axiosRes.headers } : {},
    };
}

// ─── Internal HTTP Client ───────────────────────────────────────────────────
async function request(
    method: 'get' | 'post' | 'patch' | 'put' | 'delete',
    path: string,
    body?: any,
    token?: string,
    extra?: AxiosRequestConfig,
): Promise<ApiResponse> {
    const url = `${API_BASE}${path}`;
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(extra?.headers as Record<string, string> || {}),
    };

    try {
        const res = await axios({
            method,
            url,
            data: body,
            headers,
            timeout: 15000,
            validateStatus: () => true,
            ...(extra ? { transformRequest: extra.transformRequest } : {}),
        });
        return toApiResponse(res);
    } catch (err: any) {
        // Network errors (ECONNREFUSED, etc.)
        return {
            status: 0,
            data: { error: err.message || 'Network error' },
            headers: {},
        };
    }
}

// ─── Auth Helpers ───────────────────────────────────────────────────────────

export async function loginAsAdmin(): Promise<string> {
    if (adminToken) return adminToken;
    const res = await request('post', '/auth/login', {
        email: ADMIN_USER.email,
        password: ADMIN_USER.password,
    });
    if (res.status !== 200) {
        throw new Error(`Admin login failed: ${res.status} — ${JSON.stringify(res.data)}`);
    }
    adminToken = res.data.data?.accessToken ?? res.data.accessToken;
    return adminToken!;
}

export async function loginAsClient(): Promise<string> {
    if (clientToken) return clientToken;
    const res = await request('post', '/auth/login', {
        email: CLIENT_USER.email,
        password: CLIENT_USER.password,
    });
    if (res.status !== 200) {
        throw new Error(`Client login failed: ${res.status} — ${JSON.stringify(res.data)}`);
    }
    clientToken = res.data.data?.accessToken ?? res.data.accessToken;
    return clientToken!;
}

export async function registerNewUser(data: {
    email: string;
    password: string;
    name: string;
}): Promise<ApiResponse> {
    return request('post', '/auth/register', data);
}

export function clearTokenCache(): void {
    adminToken = null;
    clientToken = null;
}

// ─── HTTP Wrappers ──────────────────────────────────────────────────────────

export async function apiGet(
    path: string,
    token?: string,
    config?: AxiosRequestConfig,
): Promise<ApiResponse> {
    return request('get', path, undefined, token, config);
}

export async function apiPost(
    path: string,
    body?: Record<string, unknown>,
    token?: string,
    config?: AxiosRequestConfig,
): Promise<ApiResponse> {
    return request('post', path, body, token, config);
}

export async function apiPatch(
    path: string,
    body?: Record<string, unknown>,
    token?: string,
    config?: AxiosRequestConfig,
): Promise<ApiResponse> {
    return request('patch', path, body, token, config);
}

export async function apiDelete(
    path: string,
    token?: string,
    config?: AxiosRequestConfig,
): Promise<ApiResponse> {
    return request('delete', path, undefined, token, config);
}

export async function apiPut(
    path: string,
    body?: Record<string, unknown>,
    token?: string,
    config?: AxiosRequestConfig,
): Promise<ApiResponse> {
    return request('put', path, body, token, config);
}

// ─── Async Wait Helpers ─────────────────────────────────────────────────────

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function waitFor(
    fn: () => Promise<boolean>,
    timeoutMs = 10000,
    pollIntervalMs = 500,
): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        if (await fn()) return;
        await sleep(pollIntervalMs);
    }
    throw new Error(`waitFor timed out after ${timeoutMs}ms`);
}

// ─── Assertion Helpers ──────────────────────────────────────────────────────

export function expectSuccessResponse(res: ApiResponse, httpStatus = 200): void {
    expect(res.status).toBe(httpStatus);
    expect(res.data).toHaveProperty('status', 'success');
    expect(res.data).toHaveProperty('metadata');
    expect(res.data.metadata).toHaveProperty('requestId');
    expect(res.data.metadata).toHaveProperty('version');
}

export function expectPaginatedResponse(res: ApiResponse): void {
    expectSuccessResponse(res, 200);
    expect(res.data).toHaveProperty('data');
    expect(Array.isArray(res.data.data)).toBe(true);
    expect(res.data).toHaveProperty('pagination');
    expect(res.data.pagination).toHaveProperty('page');
    expect(res.data.pagination).toHaveProperty('limit');
    expect(res.data.pagination).toHaveProperty('total');
    expect(res.data.pagination).toHaveProperty('totalPages');
}

export function expectErrorResponse(
    res: ApiResponse,
    httpStatus: number,
    errorCode?: string,
): void {
    expect(res.status).toBe(httpStatus);
    expect(res.data).toHaveProperty('status', 'error');
    expect(res.data).toHaveProperty('error');
    if (errorCode) {
        expect(res.data.error).toHaveProperty('code', errorCode);
    }
}

export function expectStandardHeaders(res: ApiResponse): void {
    expect(res.headers).toHaveProperty('x-request-id');
    expect(res.headers).toHaveProperty('x-api-version');
}

export function uniqueEmail(prefix = 'e2e'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@nestlancer.dev`;
}

export function uniqueSlug(prefix = 'e2e'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

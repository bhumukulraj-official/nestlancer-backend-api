export function createTestAccessToken(payload: { userId: string; email: string; role: string }): string {
  void payload;
  return 'test-jwt-token';
}
export function createTestAuthHeaders(token?: string): Record<string, string> {
  return { Authorization: \`Bearer \${token || 'test-jwt-token'}\`, 'X-Correlation-ID': 'test-correlation-id' };
}

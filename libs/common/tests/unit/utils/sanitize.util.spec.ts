import { maskSensitiveFields } from '../../../src/utils/sanitize.util';

describe('SanitizeUtils', () => {
  describe('maskSensitiveFields', () => {
    it('should mask sensitive fields', () => {
      const input = {
        username: 'john',
        password: 'secret_password',
        token: 'secret_token',
      };
      const result = maskSensitiveFields(input);
      expect(result.username).toBe('john');
      expect(result.password).toBe('***REDACTED***');
      expect(result.token).toBe('***REDACTED***');
    });

    it('should handle nested objects', () => {
      const input = {
        user: {
          username: 'john',
          credentials: {
            password: 'pwd',
          },
        },
      };
      const result = maskSensitiveFields(input) as any;
      expect(result.user.username).toBe('john');
      expect(result.user.credentials.password).toBe('***REDACTED***');
    });

    it('should handle custom fields', () => {
      const input = {
        apiKey: '12345',
      };
      const result = maskSensitiveFields(input, ['apiKey']);
      expect(result.apiKey).toBe('***REDACTED***');
    });
  });
});

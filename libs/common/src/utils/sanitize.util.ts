/** Masks sensitive fields in objects for logging */
export function maskSensitiveFields(
  obj: Record<string, unknown>,
  fields: string[] = ['password', 'token', 'secret', 'authorization', 'cookie', 'creditCard'],
): Record<string, unknown> {
  const masked: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (fields.some((f) => key.toLowerCase().includes(f.toLowerCase()))) {
      masked[key] = '***REDACTED***';
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      masked[key] = maskSensitiveFields(value as Record<string, unknown>, fields);
    } else {
      masked[key] = value;
    }
  }
  return masked;
}

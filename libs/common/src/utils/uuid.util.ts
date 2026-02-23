import { randomUUID } from 'crypto';

/** Generates a UUID v4 */
export function generateUuid(): string {
  return randomUUID();
}

/** Validates a string is a valid UUID v4 */
export function isValidUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

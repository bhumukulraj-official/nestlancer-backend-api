/**
 * E2E Wait/Polling Utilities
 *
 * Generic polling and retry utilities for E2E tests.
 * Used to wait for asynchronous side effects (emails, queue messages, DB records, etc.)
 */

import axios from 'axios';

export interface WaitForOptions {
  /** Maximum time to wait in milliseconds. Default: 30000 */
  timeoutMs?: number;
  /** Polling interval in milliseconds. Default: 1000 */
  intervalMs?: number;
  /** Description for error messages */
  description?: string;
}

/**
 * Poll a condition function until it returns a truthy value or timeout.
 *
 * @param fn - Function to poll. Should return a truthy value when the condition is met, or null/undefined/false otherwise.
 * @param options - Polling options.
 * @returns The truthy value returned by fn, or null if timeout.
 */
export async function waitFor<T>(
  fn: () => Promise<T | null | undefined | false>,
  options: WaitForOptions = {},
): Promise<T | null> {
  const { timeoutMs = 30000, intervalMs = 1000, description = 'condition' } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    try {
      const result = await fn();
      if (result) {
        return result as T;
      }
    } catch {
      // Ignore errors during polling – just retry
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  console.warn(`⏳ Timeout waiting for ${description} after ${timeoutMs}ms`);
  return null;
}

/**
 * Wait for a service URL to respond with HTTP 200.
 */
export async function waitForService(url: string, options: WaitForOptions = {}): Promise<boolean> {
  const result = await waitFor(
    async () => {
      try {
        const response = await axios.get(url, { timeout: 5000 });
        return response.status === 200 ? true : null;
      } catch {
        return null;
      }
    },
    { ...options, description: options.description || `service at ${url}` },
  );

  return result === true;
}

/**
 * Retry a function with exponential backoff.
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelayMs?: number;
    backoffMultiplier?: number;
    description?: string;
  } = {},
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelayMs = 1000,
    backoffMultiplier = 2,
    description = 'operation',
  } = options;

  let lastError: Error | null = null;
  let delay = initialDelayMs;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        console.log(`  ⏳ Retry ${attempt}/${maxRetries} for ${description} (waiting ${delay}ms)`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= backoffMultiplier;
      }
    }
  }

  throw new Error(`Failed ${description} after ${maxRetries} retries: ${lastError?.message}`);
}

/**
 * Simple delay/sleep utility.
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

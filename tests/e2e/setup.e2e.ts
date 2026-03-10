/**
 * E2E Test Global Setup
 *
 * This file runs before all E2E tests. It:
 * 1. Loads .env.e2e environment variables
 * 2. Verifies the gateway is reachable
 * 3. Sets up global test state (auth tokens, etc.)
 */

import * as path from 'path';
import * as fs from 'fs';
import axios, { AxiosError } from 'axios';

// ── Load .env.e2e ────────────────────────────────────────────

function loadEnvFile(filePath: string): void {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  Env file not found: ${filePath}`);
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex > 0) {
        const key = trimmed.substring(0, eqIndex).trim();
        const value = trimmed
          .substring(eqIndex + 1)
          .trim()
          .replace(/^["']|["']$/g, '');
        // Don't override existing env vars (allows CI to inject values)
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  });
}

const envPath = path.resolve(__dirname, '../../.env.e2e');
loadEnvFile(envPath);

// ── Configuration ────────────────────────────────────────────

const GATEWAY_URL = process.env.E2E_GATEWAY_URL || 'http://localhost:3000';
const WS_GATEWAY_URL = process.env.E2E_WS_GATEWAY_URL || 'http://localhost:3100';
const HEALTH_ENDPOINT = `${GATEWAY_URL}/api/v1/health`;
const MAX_RETRIES = 30;
const RETRY_INTERVAL_MS = 2000;

// ── Global State ─────────────────────────────────────────────

declare global {
  // eslint-disable-next-line no-var
  var __E2E__: {
    gatewayUrl: string;
    wsGatewayUrl: string;
    apiBaseUrl: string;
  };
}

// ── Health Check ─────────────────────────────────────────────

async function waitForGateway(): Promise<void> {
  console.log(`\n🔍 Waiting for gateway at ${HEALTH_ENDPOINT}...`);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios.get(HEALTH_ENDPOINT, { timeout: 5000 });
      if (response.status === 200) {
        console.log(`✅ Gateway is healthy (attempt ${attempt}/${MAX_RETRIES})`);
        return;
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status || 'UNREACHABLE';
      if (attempt % 5 === 0 || attempt === 1) {
        console.log(`  ⏳ Attempt ${attempt}/${MAX_RETRIES} – status: ${status}`);
      }
    }

    if (attempt < MAX_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL_MS));
    }
  }

  throw new Error(
    `❌ Gateway at ${HEALTH_ENDPOINT} did not become healthy after ${MAX_RETRIES} attempts`,
  );
}

// ── Setup & Teardown ─────────────────────────────────────────

beforeAll(async () => {
  // Set global test configuration
  global.__E2E__ = {
    gatewayUrl: GATEWAY_URL,
    wsGatewayUrl: WS_GATEWAY_URL,
    apiBaseUrl: `${GATEWAY_URL}/api/v1`,
  };

  // Wait for the gateway to be healthy
  await waitForGateway();

  console.log('\n🚀 E2E test suite starting...\n');
}, 120000); // 2 minute timeout for setup

afterAll(async () => {
  console.log('\n🏁 E2E test suite complete.\n');
}, 30000);

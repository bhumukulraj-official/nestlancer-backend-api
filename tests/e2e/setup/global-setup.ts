/**
 * Global E2E Setup
 *
 * Runs once before all E2E test suites.
 * Verifies that the API gateway is reachable.
 */
import axios from 'axios';
import { API_BASE } from './seed-data';

const MAX_RETRIES = 30;
const RETRY_INTERVAL_MS = 2000;

export default async function globalSetup(): Promise<void> {
    console.log('\n🧪 E2E Global Setup — Waiting for API Gateway...');

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const res = await axios.get(`${API_BASE}/health`, { timeout: 3000 });
            if (res.status === 200) {
                console.log(`✅ API Gateway is healthy (attempt ${attempt}/${MAX_RETRIES})`);
                return;
            }
        } catch {
            // Gateway not ready yet
        }

        if (attempt < MAX_RETRIES) {
            console.log(`   ⏳ Attempt ${attempt}/${MAX_RETRIES} — retrying in ${RETRY_INTERVAL_MS}ms...`);
            await new Promise((r) => setTimeout(r, RETRY_INTERVAL_MS));
        }
    }

    throw new Error(
        `❌ API Gateway did not become healthy after ${MAX_RETRIES} attempts.\n` +
        `   Make sure all services are running: pnpm turbo dev\n` +
        `   Expected health endpoint: ${API_BASE}/health`,
    );
}

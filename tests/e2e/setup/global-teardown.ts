/**
 * Global E2E Teardown
 *
 * Runs once after all E2E test suites complete.
 * Performs any necessary cleanup.
 */

export default async function globalTeardown(): Promise<void> {
    console.log('\n🧹 E2E Global Teardown — Cleaning up...');
    // Infrastructure teardown (docker-compose down) is handled externally
    // by the CI pipeline or the developer's shell script.
    console.log('✅ E2E Teardown complete.');
}

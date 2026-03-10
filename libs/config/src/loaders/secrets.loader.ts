import { Logger } from '@nestjs/common';

const logger = new Logger('SecretsLoader');

/**
 * Loads secrets from Infisical or environment variables.
 * In production, secrets are injected at runtime by the Infisical agent.
 * This loader serves as a fallback and validation layer.
 */
export async function loadSecrets(): Promise<Record<string, string>> {
  const secrets: Record<string, string> = {};
  const infisicalToken = process.env.INFISICAL_TOKEN;
  const infisicalEnv = process.env.INFISICAL_ENV || 'dev';

  if (!infisicalToken || infisicalToken.startsWith('st.dev_dummy') || infisicalToken === 'dummy') {
    logger.warn('Infisical token not configured — using environment variables for secrets');
    return secrets;
  }

  try {
    // In production, the Infisical sidecar/agent injects secrets into env vars.
    // This loader validates that required secrets are present.
    const requiredSecrets = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'DATABASE_URL'];

    for (const key of requiredSecrets) {
      const value = process.env[key];
      if (value) {
        secrets[key] = value;
      } else {
        logger.warn(`Required secret ${key} is not set in environment ${infisicalEnv}`);
      }
    }

    logger.log(
      `Secrets loaded for environment: ${infisicalEnv} (${Object.keys(secrets).length} secrets)`,
    );
  } catch (error) {
    logger.error(
      'Failed to load secrets from Infisical',
      error instanceof Error ? error.message : String(error),
    );
  }

  return secrets;
}

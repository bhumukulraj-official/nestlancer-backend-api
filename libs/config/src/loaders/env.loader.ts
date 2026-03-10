import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

export function loadEnvConfig(): Record<string, string> {
  const envFile = resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`);
  const fallbackFile = resolve(process.cwd(), '.env');

  const file = existsSync(envFile) ? envFile : existsSync(fallbackFile) ? fallbackFile : null;
  if (!file) return {};

  const content = readFileSync(file, 'utf-8');
  const config: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...valueParts] = trimmed.split('=');
    if (key)
      config[key.trim()] = valueParts
        .join('=')
        .trim()
        .replace(/^["']|["']$/g, '');
  }
  return config;
}

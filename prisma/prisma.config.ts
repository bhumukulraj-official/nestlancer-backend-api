import { defineConfig } from 'prisma/config';

/**
 * Prisma configuration file.
 *
 * Configures the Prisma client generation, logging, and binary targets.
 * - Uses multi-file schema support (prisma/schema/ directory).
 * - Configures native and linux-musl binary targets for Docker deployments.
 */
export default defineConfig({
    earlyAccess: true,
    schema: './schema',
});

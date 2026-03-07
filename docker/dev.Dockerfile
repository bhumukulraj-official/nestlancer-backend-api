FROM node:20-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace configuration and lockfile
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json turbo.json ./

# Copy all package.json files to allow pnpm install to work properly
# This is a bit tedious in a monorepo, but necessary for caching
COPY gateway/package.json ./gateway/
COPY ws-gateway/package.json ./ws-gateway/
COPY libs/ ./libs/
# We copy all libs package.json files (we can use a find command if there are many, but let's see)
# Actually, pnpm install will fail if it can't find the workspace packages.
# Let's use a simpler approach for dev: skip the COPY of all package.json for now and see if we can just copy everything.
# For DEV, layer caching is less critical than correctness during development.

COPY . .

# Install dependencies
RUN pnpm install

# Generate Prisma client
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" pnpm prisma generate --schema prisma/schema

# Default command (will be overridden in docker-compose.dev.yml)
CMD ["pnpm", "turbo", "dev"]

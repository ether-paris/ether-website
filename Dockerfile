# syntax=docker/dockerfile:1.6

FROM oven/bun:1 AS base
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
COPY package.json package-lock.json ./
# Bun can install from package-lock.json (it converts it to bun.lockb implicitly or respects it)
# using 'bun install' is preferred.
RUN bun install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js build
ENV NODE_ENV=production
RUN bun run build

# Production image, copy all the files and run next
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

# Copy necessary files for standalone mode
COPY --from=build /app/public ./public
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/.next/standalone ./

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# server.js is the entrypoint for standalone Next.js
CMD ["bun", "server.js"]

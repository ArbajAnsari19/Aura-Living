# Backend image. Build context = ./backend
#   docker build -t spur-backend ./backend
# Multi-stage: compile TS in a builder, ship a slim runtime.
FROM node:20-slim AS builder
WORKDIR /app
# OpenSSL is required by Prisma engines.
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
COPY package.json ./
RUN npm install
COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
COPY package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
EXPOSE 4000
# Apply migrations, then start. (Knowledge seed: run `npx tsx prisma/seed.ts` once after deploy.)
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]

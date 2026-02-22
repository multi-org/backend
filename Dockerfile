FROM node:22-slim AS builder

WORKDIR /app

RUN apt-get update -y \
  && apt-get install -y openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run dist

FROM node:22-slim

WORKDIR /app

RUN apt-get update -y \
  && apt-get install -y openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

RUN groupadd -r appuser && useradd -r -g appuser appuser \
  && chown -R appuser:appuser /app

USER appuser

EXPOSE 8083

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8083/healthz', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Adicionar variável de ambiente para produção
ENV NODE_ENV=production

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
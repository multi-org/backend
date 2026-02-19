FROM node:18-slim AS builder

WORKDIR /app

RUN apt-get update -y \
  && apt-get install -y openssl \
  && rm -rf /var/lib/apt/lists/*


COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run dist


FROM node:18-slim

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

EXPOSE 8083

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
# ---- Build stage ----
FROM node:18-slim AS builder

WORKDIR /usr/src/app

# Dependências do sistema (openssl para Prisma)
RUN apt-get update -y && apt-get install -y openssl

# Instala dependências de dev e produção
COPY package*.json ./
RUN npm install

# Copia todo o código
COPY . .

# Build TypeScript
RUN npm run dist

# Gera Prisma Client
RUN npx prisma generate

# ---- Runtime stage ----
FROM node:18-slim

WORKDIR /usr/src/app

# Dependências do sistema (openssl para Prisma)
RUN apt-get update -y && apt-get install -y openssl

# Copia apenas dependências de produção
COPY package*.json ./
RUN npm install --omit=dev

# Copia build e pasta prisma do builder
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma

# Gera Prisma Client no runtime (garante que funcione)
RUN npx prisma generate

# Porta
EXPOSE 8080

# Aplica migrations e inicia servidor
# ...existing code...
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
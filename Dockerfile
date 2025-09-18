# ---- Build stage ----
FROM node:18-slim AS builder

WORKDIR /usr/src/app

# Dependências do sistema (openssl pro Prisma)
RUN apt-get update -y && apt-get install -y openssl

# Instala dependências
COPY package*.json ./
RUN npm install

# Copia código e gera build
COPY . .
RUN npm run dist
RUN npx prisma generate


# ---- Runtime stage ----
FROM node:18-slim

WORKDIR /usr/src/app

# Dependências do sistema (openssl pro Prisma)
RUN apt-get update -y && apt-get install -y openssl

# Copia apenas o necessário
COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

# Porta (Render sobrescreve com $PORT, mas exponho 8080 por padrão)
EXPOSE 8080

# Roda migrations antes de iniciar o servidor
CMD npx prisma migrate deploy && node dist/server.js

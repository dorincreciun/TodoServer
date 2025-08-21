# Multi-stage build pentru optimizare
FROM node:18-alpine AS base

# Instalează dependențele necesare pentru build
RUN apk add --no-cache python3 make g++

# Setează directorul de lucru
WORKDIR /app

# Copiază fișierele de configurare
COPY package*.json ./
COPY .env.example ./

# Instalează dependențele
FROM base AS dependencies
RUN npm ci --only=production && npm cache clean --force

# Stage pentru development dependencies
FROM base AS dev-dependencies
RUN npm ci

# Stage pentru build
FROM dev-dependencies AS build
COPY . .
RUN npm run build

# Stage pentru producție
FROM node:18-alpine AS production

# Creează utilizatorul non-root pentru securitate
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Instalează dumb-init pentru gestionarea semnalelor
RUN apk add --no-cache dumb-init

# Setează directorul de lucru
WORKDIR /app

# Copiază node_modules și fișierele necesare
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app ./

# Creează directoarele necesare
RUN mkdir -p logs uploads && \
    chown -R nodejs:nodejs /app

# Schimbă la utilizatorul non-root
USER nodejs

# Expune portul
EXPOSE 3000

# Setează variabilele de mediu pentru producție
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Folosește dumb-init pentru gestionarea semnalelor
ENTRYPOINT ["dumb-init", "--"]

# Comanda de pornire
CMD ["node", "server.js"] 
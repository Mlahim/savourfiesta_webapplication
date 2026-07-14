# ── Stage 1: Install dependencies ──
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ── Stage 2: Build the Vite app ──
FROM node:22-alpine AS builder
WORKDIR /app

# Build arg for API URL (baked into the static bundle at build time)
ARG VITE_API_URL=http://localhost:5000/api

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set the env var so Vite picks it up during build
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ── Stage 3: Serve with Nginx ──
FROM nginx:1.27-alpine AS production

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

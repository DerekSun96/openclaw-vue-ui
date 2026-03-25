# Stage 1: Build frontend
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build-only

# Stage 2: Runtime
FROM node:22-alpine
RUN apk add --no-cache nginx

# Copy frontend static files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy proxy files
WORKDIR /app
COPY proxy.ts package.json ./
RUN npm install --omit=dev tsx ws @types/ws

# Nginx config
COPY docker/nginx.conf /etc/nginx/http.d/default.conf

# Start script
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 80
CMD ["/start.sh"]

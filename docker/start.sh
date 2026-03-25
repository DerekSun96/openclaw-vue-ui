#!/bin/sh
echo "[start] Starting OpenClaw Vue UI..."

# Start proxy in background
cd /app && npx tsx proxy.ts &
PROXY_PID=$!

# Wait for proxy to be ready
sleep 2

echo "[start] Proxy started (PID: $PROXY_PID)"
echo "[start] Starting Nginx..."

# Start nginx in foreground
nginx -g 'daemon off;'

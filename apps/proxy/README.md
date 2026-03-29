# Proxy App

Node.js 代理服务，负责：

- 与 OpenClaw Gateway 建立认证连接
- 将 WebSocket 消息转发给前端
- 暴露 `GET /api/openclaw/skills` 给前端读取 workspace skills

## 常用命令

```bash
npm install
npm run dev
npm run build
npm run start
```

## `.env` 自动加载

进程启动时会自动读取当前工作目录下的 `.env` 文件。

- 本地运行时，会读取 `apps/proxy/.env`
- Docker 运行时，会读取容器内的 `/app/.env`

如果同时又通过容器环境变量或 `docker run -e` 传值，显式传入的环境变量优先级更高，`.env` 只作为默认值来源。

## 环境变量

参考 [`.env.example`](./.env.example)：

- `OPENCLAW_GATEWAY_URL`
- `OPENCLAW_GATEWAY_TOKEN`
- `PROXY_HOST`
- `PROXY_PORT`
- `CORS_ORIGIN`

# OpenClaw UI 部署说明

## 拆分后的部署模型

仓库现在包含两个独立应用：

1. `apps/frontend`
   用于发布前端静态资源。
2. `apps/proxy`
   用于连接 OpenClaw Gateway，并对前端提供 WebSocket 与 HTTP 接口。

它们可以：

- 部署在同一台机器
- 部署在不同容器
- 部署在不同域名

## 前端部署

### 构建

```bash
npm --prefix apps/frontend install
npm --prefix apps/frontend run build
```

### Docker

```bash
docker build -t openclaw-ui-frontend ./apps/frontend
docker run -d --name openclaw-ui-frontend -p 8080:80 openclaw-ui-frontend
```

### 运行时代理配置

修改 `apps/frontend/public/config.json`，或者挂载覆盖容器内的 `/usr/share/nginx/html/config.json`：

```json
{
  "proxyUrl": "ws://proxy.example.com:18790",
  "proxyApiBase": "http://proxy.example.com:18790/api"
}
```

如果前端和代理走 HTTPS/WSS，建议也对应填成 `https://` / `wss://`。

## 代理部署

### 构建

```bash
npm --prefix apps/proxy install
npm --prefix apps/proxy run build
```

### Docker

```bash
docker build -t openclaw-ui-proxy ./apps/proxy
docker run -d --name openclaw-ui-proxy \
  -p 18790:18790 \
  -e OPENCLAW_GATEWAY_URL=ws://127.0.0.1:18789 \
  -e PROXY_HOST=0.0.0.0 \
  -e PROXY_PORT=18790 \
  -e CORS_ORIGIN=* \
  openclaw-ui-proxy
```

proxy 现在会在容器启动时自动读取 `/app/.env`。你可以直接在 `apps/proxy` 目录创建 `.env` 后构建镜像，或者在运行时挂载：

```bash
docker run -d --name openclaw-ui-proxy \
  -p 18790:18790 \
  -v $(pwd)/apps/proxy/.env:/app/.env:ro \
  openclaw-ui-proxy
```

### 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `OPENCLAW_GATEWAY_URL` | `ws://127.0.0.1:18789` | Gateway WebSocket 地址 |
| `OPENCLAW_GATEWAY_TOKEN` | 从 `~/.openclaw/openclaw.json` 读取 | Gateway 共享密钥 |
| `PROXY_HOST` | `0.0.0.0` | 代理监听地址 |
| `PROXY_PORT` | `18790` | 代理监听端口 |
| `CORS_ORIGIN` | `*` | 允许访问代理 HTTP 接口的来源 |

### 健康检查

代理提供：

- `GET /healthz`
- `GET /api/openclaw/skills`
- WebSocket `/`

## 同机联调

根目录仍然保留了统一脚本：

```bash
npm install
npm --prefix apps/frontend install
npm --prefix apps/proxy install
npm run dev
```

这会并行启动：

- 前端 Vite 开发服务
- OpenClaw 代理服务

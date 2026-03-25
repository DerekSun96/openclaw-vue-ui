# OpenClaw Vue UI 部署指南

## 本地开发

```bash
npm run start
```

同时启动 Proxy（端口 18790）和 Vite dev server（端口 5173），浏览器打开 `http://localhost:5173`。

也可单独启动：
- `npm run proxy` — 仅启动 WebSocket 认证代理
- `npm run dev` — 仅启动前端开发服务器

## Docker 部署

### 构建镜像

```bash
docker build -t openclaw-ui .
```

### 运行（与 OpenClaw 容器共享网络）

```bash
docker run -d --name openclaw-ui \
  --network container:<openclaw-container-name> \
  -p 8080:80 \
  -e OPENCLAW_GATEWAY_URL=ws://127.0.0.1:18789 \
  openclaw-ui
```

### 或使用 docker-compose

```yaml
services:
  openclaw-ui:
    build: ./openclaw-vue-ui
    ports:
      - "8080:80"
    network_mode: "service:openclaw"
    environment:
      - OPENCLAW_GATEWAY_URL=ws://127.0.0.1:18789
```

浏览器访问 `http://<host>:8080`。

## 自定义连接地址

前端支持三种方式指定 Proxy WebSocket 地址（优先级从高到低）：

### 1. URL 参数

```
http://<host>:8080?proxyUrl=ws://192.168.1.100:18790
```

### 2. 运行时配置文件

修改容器内 `/usr/share/nginx/html/config.json`：

```json
{ "proxyUrl": "ws://192.168.1.100:18790" }
```

可通过 Docker volume 挂载覆盖，无需重新构建镜像：

```bash
docker run -d -p 8080:80 \
  -v ./my-config.json:/usr/share/nginx/html/config.json \
  openclaw-ui
```

### 3. 默认

自动使用当前页面地址拼接 `ws://<当前host>/ws`，由 Nginx 反代到本地 Proxy。

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `OPENCLAW_GATEWAY_URL` | `ws://127.0.0.1:18789` | Gateway WebSocket 地址 |
| `OPENCLAW_GATEWAY_TOKEN` | 从 `~/.openclaw/openclaw.json` 读取 | Gateway 共享密钥 |
| `PROXY_PORT` | `18790` | Proxy 监听端口 |

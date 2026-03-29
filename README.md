# OpenClaw UI Workspace

这个仓库现在已经拆成两个可独立发布的应用：

- `apps/frontend`: Vue 3 前端页面
- `apps/proxy`: OpenClaw Gateway 代理服务

## 目录结构

```text
.
├── apps
│   ├── frontend
│   └── proxy
├── package.json
├── README.md
└── DEPLOY.md
```

## 本地开发

先分别安装依赖：

```bash
npm install
npm --prefix apps/frontend install
npm --prefix apps/proxy install
```

同时启动前后端：

```bash
npm run dev
```

分别启动：

```bash
npm run dev:frontend
npm run dev:proxy
```

## 构建

同时构建：

```bash
npm run build
```

分别构建：

```bash
npm run build:frontend
npm run build:proxy
```

## Docker 启动

### 启动前端

```bash
docker build -t openclaw-ui-frontend ./apps/frontend
docker run -d --name openclaw-ui-frontend -p 8080:80 openclaw-ui-frontend
```

启动后可通过 `http://localhost:8080` 访问前端页面。

### 启动 proxy

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

如果你希望 proxy 自动读取 `.env`，可以把 `apps/proxy/.env` 挂载到容器内：

```bash
docker run -d --name openclaw-ui-proxy \
  -p 18790:18790 \
  -v $(pwd)/apps/proxy/.env:/app/.env:ro \
  openclaw-ui-proxy
```

### 前后端分离启动示例

当前端和 proxy 分开部署时，前端需要知道 proxy 地址。可以修改 [apps/frontend/public/config.json](/Users/sunyeliang/work_dir/我的目录/wsrc/openclaw-vue-ui/apps/frontend/public/config.json)：

```json
{
  "proxyUrl": "ws://proxy-host:18790",
  "proxyApiBase": "http://proxy-host:18790/api"
}
```

然后重新构建前端镜像，或者在容器里挂载这个文件覆盖 `/usr/share/nginx/html/config.json`。

## 运行时配置

前端支持运行时指定代理地址，`apps/frontend/public/config.json` 中可配置：

```json
{
  "proxyUrl": "ws://proxy-host:18790",
  "proxyApiBase": "http://proxy-host:18790/api"
}
```

也支持通过 URL 参数覆盖：

- `?proxyUrl=ws://proxy-host:18790`
- `?proxyApiBase=http://proxy-host:18790/api`

如果未配置，前端默认使用当前站点同源的 `/ws` 和 `/api`。

## 说明

- 业务后端接口仍由前端自己的 `VITE_API_URL` 和 `VITE_API_URL_Library` 控制。
- OpenClaw 代理已经从前端构建与容器中拆出，可独立部署、单独扩缩容。
- 更详细的部署方式见 [DEPLOY.md](./DEPLOY.md)。

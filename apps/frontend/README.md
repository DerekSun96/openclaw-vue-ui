# Frontend App

Vue 3 前端页面，负责展示 UI、连接业务后端，并通过运行时配置接入 OpenClaw 代理。

## 常用命令

```bash
npm install
npm run dev
npm run build
```

## 环境变量

参考 [`.env.example`](./.env.example)：

- `VITE_API_URL`
- `VITE_API_URL_Library`
- `VITE_PROXY_HTTP_URL`
- `VITE_PROXY_WS_URL`

## 运行时配置

发布后可通过 `public/config.json` 覆盖 OpenClaw 代理地址：

```json
{
  "proxyUrl": "ws://proxy-host:18790",
  "proxyApiBase": "http://proxy-host:18790/api"
}
```

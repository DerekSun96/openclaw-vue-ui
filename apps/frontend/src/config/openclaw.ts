interface RuntimeConfig {
  proxyUrl?: string
  proxyApiBase?: string
  proxyHttpUrl?: string
}

interface OpenClawEndpoints {
  wsUrl: string
  apiBase: string
}

let runtimeConfigPromise: Promise<RuntimeConfig> | null = null

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, '')
}

function loadRuntimeConfig(): Promise<RuntimeConfig> {
  if (!runtimeConfigPromise) {
    runtimeConfigPromise = fetch(`${import.meta.env.BASE_URL}config.json`)
      .then(async (response) => {
        if (!response.ok) return {}
        return await response.json() as RuntimeConfig
      })
      .catch(() => ({}))
  }

  return runtimeConfigPromise
}

function getDefaultWsUrl(): string {
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${location.host}/ws`
}

function getDefaultApiBase(): string {
  return `${location.origin}/api`
}

function deriveApiBaseFromWs(wsUrl: string): string | null {
  try {
    const url = new URL(wsUrl)
    url.protocol = url.protocol === 'wss:' ? 'https:' : 'http:'
    url.pathname = '/api'
    url.search = ''
    url.hash = ''
    return normalizeBaseUrl(url.toString())
  } catch {
    return null
  }
}

export async function resolveOpenClawEndpoints(): Promise<OpenClawEndpoints> {
  const params = new URLSearchParams(location.search)
  const config = await loadRuntimeConfig()

  const wsUrl = params.get('proxyUrl') || config.proxyUrl || getDefaultWsUrl()
  const apiBase = params.get('proxyApiBase')
    || params.get('proxyHttpUrl')
    || config.proxyApiBase
    || config.proxyHttpUrl
    || deriveApiBaseFromWs(wsUrl)
    || getDefaultApiBase()

  return {
    wsUrl,
    apiBase: normalizeBaseUrl(apiBase),
  }
}

export async function resolveOpenClawApiUrl(pathname: string): Promise<string> {
  const { apiBase } = await resolveOpenClawEndpoints()
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`
  return `${apiBase}${normalizedPath}`
}

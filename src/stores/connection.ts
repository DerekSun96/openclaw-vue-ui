import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ConnectionStatus } from '@/types/protocol'
import { GatewayClient } from '@/services/gateway'

export const gateway = new GatewayClient()

export const useConnectionStore = defineStore('connection', () => {
  const status = ref<ConnectionStatus>('disconnected')
  const error = ref<string | null>(null)

  const pairingRequired = ref(false)
  const pairingMessage = ref('')

  gateway.onStatusChange = (s) => {
    status.value = s as ConnectionStatus
  }

  // Listen for proxy events
  gateway.on('proxy.connected', () => {
    pairingRequired.value = false
    status.value = 'connected'
    console.log('[Gateway] Proxy authenticated')
  })

  gateway.on('proxy.pairing-required', (payload) => {
    pairingRequired.value = true
    pairingMessage.value = (payload as any)?.message ?? 'Please approve device pairing in OpenClaw dashboard'
    console.log('[Gateway] Pairing required:', pairingMessage.value)
  })

  async function resolveProxyUrl(): Promise<string> {
    // 1. URL query param: ?proxyUrl=ws://...
    const params = new URLSearchParams(location.search)
    const fromQuery = params.get('proxyUrl')
    if (fromQuery) return fromQuery

    // 2. Runtime config file: /config.json
    try {
      const res = await fetch('/config.json')
      if (res.ok) {
        const cfg = await res.json()
        if (cfg.proxyUrl) return cfg.proxyUrl
      }
    } catch { /* ignore */ }

    // 3. Default: same origin
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${protocol}//${location.host}/ws`
  }

  async function connect(url?: string) {
    if (!url) url = await resolveProxyUrl()
    error.value = null
    pairingRequired.value = false
    try {
      console.log('[Gateway] Connecting to', url)
      await gateway.connect(url)
      console.log('[Gateway] Connected successfully')
    } catch (e) {
      error.value = (e as Error).message
      console.error('[Gateway] Connection failed:', e)
    }
  }

  function disconnect() {
    gateway.disconnect()
  }

  return { status, error, pairingRequired, pairingMessage, connect, disconnect }
})

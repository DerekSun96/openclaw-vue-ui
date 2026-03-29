import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ConnectionStatus } from '@/types/protocol'
import { GatewayClient } from '@/services/gateway'
import { resolveOpenClawEndpoints } from '@/config/openclaw'

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
    const { wsUrl } = await resolveOpenClawEndpoints()
    return wsUrl
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

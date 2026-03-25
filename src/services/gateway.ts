import type { RpcResponse } from '@/types/protocol'

type EventHandler = (payload: Record<string, unknown>) => void

interface PendingRequest {
  resolve: (value: unknown) => void
  reject: (reason: Error) => void
  timer: ReturnType<typeof setTimeout>
}

export class GatewayClient {
  private ws: WebSocket | null = null
  private requestId = 0
  private pending = new Map<string, PendingRequest>()
  private listeners = new Map<string, Set<EventHandler>>()
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectDelay = 1000
  private maxReconnectDelay = 30000
  private _url = ''
  private _shouldReconnect = true

  public onStatusChange?: (status: string) => void

  async connect(url: string): Promise<void> {
    this._url = url
    this._shouldReconnect = true
    this.setStatus('connecting')

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url)
      } catch (e) {
        this.setStatus('disconnected')
        reject(e)
        return
      }

      this.ws.onopen = () => {
        this.reconnectDelay = 1000
        this.setStatus('handshaking')
        resolve()
      }

      this.ws.onmessage = (event) => {
        try {
          this.dispatch(JSON.parse(event.data))
        } catch { /* ignore */ }
      }

      this.ws.onclose = () => {
        this.setStatus('disconnected')
        this.rejectAllPending('Connection closed')
        if (this._shouldReconnect) this.scheduleReconnect()
      }

      this.ws.onerror = () => {
        this.setStatus('disconnected')
        reject(new Error('WebSocket connection failed'))
      }
    })
  }

  call<T = unknown>(method: string, params: Record<string, unknown> = {}): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('Not connected'))
        return
      }
      const id = String(++this.requestId)
      const timer = setTimeout(() => {
        this.pending.delete(id)
        reject(new Error(`Request ${method} timed out`))
      }, 15000)
      this.pending.set(id, { resolve: resolve as (v: unknown) => void, reject, timer })
      this.ws.send(JSON.stringify({ type: 'req', id, method, params }))
    })
  }

  on(event: string, handler: EventHandler): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set())
    this.listeners.get(event)!.add(handler)
    return () => this.listeners.get(event)?.delete(handler)
  }

  send(data: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }

  disconnect(): void {
    this._shouldReconnect = false
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.ws?.close()
    this.ws = null
    this.setStatus('disconnected')
  }

  get connected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  private dispatch(data: Record<string, unknown>): void {
    // Response to a request
    const id = data.id as string | undefined
    if (id && this.pending.has(id)) {
      const p = this.pending.get(id)!
      clearTimeout(p.timer)
      this.pending.delete(id)
      const resp = data as unknown as RpcResponse
      if (resp.ok === false && resp.error) {
        p.reject(new Error(resp.error.message))
      } else {
        p.resolve(resp.payload ?? data)
      }
      return
    }
    // Event frame
    if ('event' in data) {
      const eventName = data.event as string
      const payload = (data.payload ?? data) as Record<string, unknown>
      this.listeners.get(eventName)?.forEach((h) => h(payload))
      this.listeners.get('*')?.forEach((h) => h(data))
      return
    }
    this.listeners.get('message')?.forEach((h) => h(data))
  }

  private setStatus(status: string): void {
    this.onStatusChange?.(status)
  }

  private rejectAllPending(reason: string): void {
    for (const [, p] of this.pending) {
      clearTimeout(p.timer)
      p.reject(new Error(reason))
    }
    this.pending.clear()
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.reconnectTimer = setTimeout(() => {
      this.connect(this._url).catch(() => {})
    }, this.reconnectDelay)
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay)
  }
}
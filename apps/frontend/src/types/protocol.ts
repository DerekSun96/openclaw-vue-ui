// JSON-RPC 2.0 Protocol Types for OpenClaw Gateway

export interface RpcRequest {
  type: 'req'
  id: number
  method: string
  params: Record<string, unknown>
}

export interface RpcResponse {
  id: number
  ok: boolean
  payload?: Record<string, unknown>
  error?: { code: string; message: string }
}

export interface EventFrame {
  event: string
  payload: Record<string, unknown>
  seq?: number
  stateVersion?: number
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'handshaking' | 'connected'

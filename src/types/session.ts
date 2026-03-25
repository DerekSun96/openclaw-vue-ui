export interface Session {
  id: string        // gateway key, e.g. "agent:main:main"
  label?: string
  channel?: string
  model?: string
  sessionId?: string
  createdAt?: number
  updatedAt?: number
  inputTokens?: number
  outputTokens?: number
  totalTokens?: number
}

export interface SessionDetail extends Session {
  systemPrompt?: string
  tools?: string[]
  messageCount?: number
}

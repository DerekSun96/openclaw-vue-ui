export interface TextBlock {
  type: 'text'
  text: string
}

export interface ToolUseBlock {
  type: 'tool_use'
  id: string
  name: string
  input: Record<string, unknown>
}

export interface ToolResultBlock {
  type: 'tool_result'
  tool_use_id: string
  content: string
  is_error?: boolean
}

export type ContentBlock = TextBlock | ToolUseBlock | ToolResultBlock

export interface TokenUsage {
  input_tokens: number
  output_tokens: number
  cache_read?: number
  cache_creation?: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'tool'
  content: ContentBlock[] | string
  timestamp: number
  model?: string
  usage?: TokenUsage
  pending?: boolean
  toolCallId?: string
  toolName?: string
}

export interface ToolCallState {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'error'
  input?: Record<string, unknown>
  output?: string
  isError?: boolean
}

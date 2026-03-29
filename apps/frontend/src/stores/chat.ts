import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ChatMessage, ToolCallState } from '@/types/message'
import { gateway } from './connection'
import { useSessionsStore } from './sessions'

export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessage[]>([])
  const streaming = ref(false)
  const streamBuffer = ref('')
  const toolCalls = ref<Map<string, ToolCallState>>(new Map())
  const loading = ref(false)

  async function loadHistory(sessionId: string) {
    loading.value = true
    messages.value = []
    toolCalls.value.clear()
    try {
      const res = await gateway.call<any>('chat.history', { sessionKey: sessionId })
      const history = res?.messages ?? []

      // First pass: extract toolCall states from assistant messages
      for (const m of history) {
        if (Array.isArray(m.content)) {
          for (const block of m.content) {
            if (block.type === 'toolCall' || block.type === 'tool_use') {
              toolCalls.value.set(block.id, {
                id: block.id,
                name: block.name,
                status: 'completed',
                input: block.arguments ?? block.input ?? {},
              })
            }
          }
        }
      }

      // Second pass: link toolResult messages to their toolCalls
      for (const m of history) {
        if (m.role === 'toolResult' && m.toolCallId) {
          const text = Array.isArray(m.content)
            ? m.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('')
            : String(m.content ?? '')
          // Ensure toolCalls map has an entry (may not exist if assistant block used different type)
          if (!toolCalls.value.has(m.toolCallId)) {
            toolCalls.value.set(m.toolCallId, {
              id: m.toolCallId,
              name: m.toolName ?? 'tool',
              status: 'completed',
              input: {},
            })
          }
          const tc = toolCalls.value.get(m.toolCallId)!
          tc.output = text
          try {
            const parsed = JSON.parse(text)
            if (parsed?.status === 'error') {
              tc.status = 'error'
              tc.isError = true
            }
          } catch { /* not JSON */ }
        }
      }

      messages.value = normalizeMessages(history)
    } catch (e) {
      console.error('Failed to load history:', e)
    } finally {
      loading.value = false
    }
  }

  async function sendMessage(text: string, sessionId: string) {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    }
    messages.value.push(userMsg)

    // 立即插入 pending assistant 消息，显示等待动画
    const idempotencyKey = `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const pendingMsg: ChatMessage = {
      id: `assistant-pending-${Date.now()}`,
      role: 'assistant',
      content: [],
      timestamp: Date.now(),
      pending: true,
    }
    ;(pendingMsg as any)._idempotencyKey = idempotencyKey
    messages.value.push(pendingMsg)
    streaming.value = true

    try {
      await gateway.call('chat.send', {
        sessionKey: sessionId,
        message: text,
        idempotencyKey,
      })
      // 发送成功后刷新会话列表（新会话会出现在列表中）
      useSessionsStore().fetchList()
    } catch (e) {
      // 发送失败，移除 pending 消息
      const idx = messages.value.indexOf(pendingMsg)
      if (idx !== -1) messages.value.splice(idx, 1)
      streaming.value = false
      console.error('Failed to send message:', e)
    }
  }

  // Handle Gateway "chat" events: { state: "delta"|"final"|"aborted"|"error", message, sessionKey, runId }
  function handleChatEvent(payload: Record<string, unknown>) {
    const state = payload.state as string
    const messageData = payload.message as any

    if (state === 'delta' || state === 'final') {
      if (messageData) {
        // Find or create the current assistant message for this run
        const runId = payload.runId as string | undefined
        // Find existing message for this runId, or create a new one
        let last = runId
          ? (messages.value.find((m) => (m as any)._runId === runId) as ChatMessage | undefined)
          : undefined

        if (!last) {
          // 复用 sendMessage 预插入的 pending 消息（最后一条 pending assistant）
          const pendingIdx = messages.value.findLastIndex(
            (m: ChatMessage) => m.role === 'assistant' && m.pending && !(m as any)._runId
          )
          if (pendingIdx !== -1) {
            last = messages.value[pendingIdx] as ChatMessage
            ;(last as any)._runId = runId
          } else {
            last = {
              id: `assistant-${Date.now()}`,
              role: 'assistant',
              content: [],
              timestamp: Date.now(),
              pending: true,
            } as ChatMessage
            ;(last as any)._runId = runId
            messages.value.push(last)
            streaming.value = true
          }
        }

        // chat 事件是快照，只用于同步 model/usage
        last.model = messageData.model ?? last.model
        if (messageData.usage) last.usage = messageData.usage

        // final 时合并内容：保留已有的 tool_use block，用快照的 text block 兜底
        if (state === 'final' && messageData.content?.length > 0) {
          const existingToolBlocks = Array.isArray(last.content)
            ? last.content.filter((b: any) => b.type === 'tool_use')
            : []
          const snapshotTextBlocks = messageData.content.filter((b: any) => b.type === 'text')
          last.content = [...existingToolBlocks, ...snapshotTextBlocks]
        }
      }

      if (state === 'final') {
        const last = getLastAssistant()
        if (last) {
          last.pending = false
          if ((payload.message as any)?.usage) last.usage = (payload.message as any).usage
        }
        streaming.value = false
        // 静默同步 tool result 内容（不清空消息列表，只更新 tool 消息）
        const sessionKey = payload.sessionKey as string | undefined
        if (sessionKey) {
          syncToolResults(sessionKey)
        }
      }
    } else if (state === 'aborted' || state === 'error') {
      const last = getLastAssistant()
      if (last) last.pending = false
      streaming.value = false
    }
  }

  // Handle Gateway "agent" events
  function handleAgentEvent(payload: Record<string, unknown>) {
    const stream = (payload as any).stream
    const data = (payload as any).data
    const runId = (payload as any).runId as string | undefined

    // 文字流式渲染：stream="assistant", data.text 是完整文本
    if (stream === 'assistant' && data?.text !== undefined) {
      let last = runId
        ? (messages.value.find((m) => (m as any)._runId === runId) as ChatMessage | undefined)
        : undefined

      if (!last) {
        // 复用 sendMessage 预插入的 pending 消息
        const pendingIdx = messages.value.findLastIndex(
          (m) => m.role === 'assistant' && m.pending && !(m as any)._runId
        )
        if (pendingIdx !== -1) {
          last = messages.value[pendingIdx] as ChatMessage
          ;(last as any)._runId = runId
        } else {
          last = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: [],
            timestamp: Date.now(),
            pending: true,
          } as ChatMessage
          ;(last as any)._runId = runId
          messages.value.push(last)
        }
        streaming.value = true
      }

      // 用完整文本更新（避免增量拼接乱序问题）
      if (Array.isArray(last.content)) {
        const textBlock = last.content.find((b: any) => b.type === 'text')
        if (textBlock) {
          (textBlock as any).text = data.text
        } else {
          last.content.push({ type: 'text', text: data.text })
        }
      } else {
        last.content = [{ type: 'text', text: data.text }]
      }
      return
    }

    // 工具调用：stream="tool"
    if (stream === 'tool') {
      if (!data?.toolCallId) return
      const { phase, toolCallId, name, args, result, meta, isError, partialResult } = data

      if (phase === 'start') {
        toolCalls.value.set(toolCallId, {
          id: toolCallId,
          name: name ?? 'tool',
          status: 'running',
          input: args ?? {},
        })
        // 找到当前 run 对应的 pending assistant 消息
        let pendingAssistantIdx = runId
          ? messages.value.findIndex((m) => (m as any)._runId === runId)
          : -1
        if (pendingAssistantIdx === -1) {
          pendingAssistantIdx = messages.value.findLastIndex(
            (m: ChatMessage) => m.role === 'assistant' && m.pending && !(m as any)._runId
          )
          if (pendingAssistantIdx !== -1 && runId) {
            ;(messages.value[pendingAssistantIdx] as any)._runId = runId
          }
        }
        // 插入 running 状态的 tool 消息（在 pending assistant 消息之前）
        const insertIdx = pendingAssistantIdx !== -1 ? pendingAssistantIdx : messages.value.length
        const toolMsg: ChatMessage = {
          id: `tool-${toolCallId}`,
          role: 'tool',
          content: '',
          timestamp: Date.now(),
          toolCallId,
          toolName: name ?? 'tool',
        }
        messages.value.splice(insertIdx, 0, toolMsg)
      } else if (phase === 'update') {
        const tc = toolCalls.value.get(toolCallId)
        if (tc) tc.output = typeof partialResult === 'string' ? partialResult : typeof meta === 'string' ? meta : JSON.stringify(partialResult ?? meta)
      } else if (phase === 'result') {
        const tc = toolCalls.value.get(toolCallId)
        // result 事件本身没有输出内容，实际内容已通过 update 事件累积在 tc.output 里
        const output = tc?.output ?? ''
        if (tc) {
          tc.status = isError ? 'error' : 'completed'
          tc.isError = !!isError
        }
        // 更新已插入的 tool 消息内容（phase=start 时已插入）
        const toolMsgIdx = messages.value.findIndex((m) => m.role === 'tool' && m.toolCallId === toolCallId)
        if (toolMsgIdx !== -1) {
          messages.value[toolMsgIdx] = { ...messages.value[toolMsgIdx]!, content: output }
        }
      }
    }
  }

  async function syncToolResults(sessionKey: string) {
    try {
      const res = await gateway.call<any>('chat.history', { sessionKey })
      const history = res?.messages ?? []
      for (const m of history) {
        if (m.role === 'toolResult' && m.toolCallId) {
          const text = Array.isArray(m.content)
            ? m.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('')
            : String(m.content ?? '')
          // 更新 toolCalls map
          const tc = toolCalls.value.get(m.toolCallId)
          if (tc) {
            tc.output = text
            try {
              const parsed = JSON.parse(text)
              if (parsed?.status === 'error') { tc.status = 'error'; tc.isError = true }
            } catch { /* ok */ }
          }
          // 更新 tool 消息 content
          const toolMsgIdx = messages.value.findIndex((msg) => msg.role === 'tool' && msg.toolCallId === m.toolCallId)
          if (toolMsgIdx !== -1) {
            messages.value[toolMsgIdx] = { ...messages.value[toolMsgIdx]!, content: text }
          }
        }
      }
    } catch { /* silent */ }
  }

  function getLastAssistant(): ChatMessage | undefined {
    for (let i = messages.value.length - 1; i >= 0; i--) {
      if (messages.value[i]?.role === 'assistant') return messages.value[i]
    }
    return undefined
  }

  function clearMessages() {
    messages.value = []
    toolCalls.value.clear()
    streaming.value = false
  }

  return { messages, streaming, streamBuffer, toolCalls, loading, loadHistory, sendMessage, handleAgentEvent, handleChatEvent, clearMessages }
})

function normalizeMessages(raw: any[]): ChatMessage[] {
  return raw.map((m, i) => ({
    id: m.id ?? `msg-${i}`,
    role: m.role === 'toolResult' ? 'tool' as const : (m.role ?? 'user') as 'user' | 'assistant' | 'tool',
    content: m.content ?? '',
    timestamp: m.timestamp ?? m.created_at ?? Date.now(),
    model: m.model,
    usage: m.usage,
    toolCallId: m.toolCallId,
    toolName: m.toolName,
  }))
}

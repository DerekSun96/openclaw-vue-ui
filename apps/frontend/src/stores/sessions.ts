import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Session } from '@/types/session'
import { gateway } from './connection'

function parseSessionLabel(key: string): string {
  // key format: "agent:main:新会话-1773651792290" or "agent:main:main"
  const parts = key.split(':')
  const name = parts[parts.length - 1] || key
  // Strip timestamp suffix for cleaner display
  return name.replace(/-\d{13}$/, '') || name
}

export const useSessionsStore = defineStore('sessions', () => {
  const list = ref<Session[]>([])
  const currentId = ref<string | null>(null)
  const loading = ref(false)

  async function fetchList() {
    loading.value = true
    try {
      const res = await gateway.call<{ sessions: any[] }>('sessions.list')
      const raw = (res as any)?.sessions ?? []
      list.value = raw.map((s: any) => ({
        id: s.key,
        label: parseSessionLabel(s.key),
        model: s.model,
        updatedAt: s.updatedAt,
        channel: s.lastChannel,
        sessionId: s.sessionId,
        inputTokens: s.inputTokens,
        outputTokens: s.outputTokens,
        totalTokens: s.totalTokens,
      }))
      if (!currentId.value && list.value.length > 0) {
        const main = list.value.find(s => s.id === 'agent:main:main')
        currentId.value = main?.id ?? list.value[0]?.id ?? null
      }
    } catch (e) {
      console.error('Failed to fetch sessions:', e)
    } finally {
      loading.value = false
    }
  }

  function selectSession(id: string) {
    currentId.value = id
  }

  function createLocalSession(): string {
    const key = `agent:main:新会话-${Date.now()}`
    list.value.unshift({
      id: key,
      label: '新会话',
      updatedAt: Date.now(),
    })
    currentId.value = key
    return key
  }

  return { list, currentId, loading, fetchList, selectSession, createLocalSession }
})

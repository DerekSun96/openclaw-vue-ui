<script setup lang="ts">
import { watch, onMounted } from 'vue'
import { useSessionsStore } from '@/stores/sessions'
import { useChatStore } from '@/stores/chat'
import { useConnectionStore } from '@/stores/connection'
import { gateway } from '@/stores/connection'
import MessageList from './MessageList.vue'
import MessageInput from './MessageInput.vue'

const sessionsStore = useSessionsStore()
const chatStore = useChatStore()
const connectionStore = useConnectionStore()

// Load history when session changes
watch(
  () => sessionsStore.currentId,
  (id) => {
    if (id && connectionStore.status === 'connected') chatStore.loadHistory(id)
  },
  { immediate: true },
)

// Subscribe to gateway events
onMounted(() => {
  gateway.on('chat', (payload) => {
    console.log('[chat event]', (payload as any).state, (payload as any).runId)
    chatStore.handleChatEvent(payload)
  })
  gateway.on('agent', (payload) => {
    const p = payload as any
    console.log('[agent event] stream:', p.stream, 'phase:', p.data?.phase, 'tool:', p.data?.name, 'runId:', p.runId)
    chatStore.handleAgentEvent(payload)
  })
})

function handleSend(text: string) {
  if (sessionsStore.currentId) {
    chatStore.sendMessage(text, sessionsStore.currentId)
  }
}
</script>

<template>
  <div class="flex flex-col h-full">
    <div v-if="connectionStore.pairingRequired" class="p-6 text-center">
      <div class="text-orange-500 text-lg mb-2">设备配对</div>
      <div class="text-gray-500 text-sm mb-4">{{ connectionStore.pairingMessage }}</div>
      <div class="text-gray-400 text-xs">请在 OpenClaw Dashboard 中批准配对请求，然后刷新页面</div>
    </div>
    <div v-else-if="connectionStore.status !== 'connected'" class="p-4 text-center text-gray-400 text-sm">
      正在连接 Gateway...
    </div>
    <MessageList :messages="chatStore.messages" :tool-calls="chatStore.toolCalls" :loading="chatStore.loading" class="flex-1" />
    <MessageInput :disabled="connectionStore.status !== 'connected'" :streaming="chatStore.streaming" @send="handleSend" />
  </div>
</template>

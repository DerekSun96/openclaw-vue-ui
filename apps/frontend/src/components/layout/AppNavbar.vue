<script setup lang="ts">
import { useConnectionStore } from '@/stores/connection'
import SessionSelector from '@/components/session/SessionSelector.vue'
import ModelSelector from '@/components/session/ModelSelector.vue'
import { branding } from '@/config/branding'

const connectionStore = useConnectionStore()

const statusColor: Record<string, string> = {
  connected: 'bg-green-500',
  connecting: 'bg-yellow-500',
  handshaking: 'bg-yellow-500',
  disconnected: 'bg-red-500',
}
</script>

<template>
  <header class="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white">
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2 text-sm text-gray-500">
        <span class="font-semibold text-gray-800">{{ branding.shortName }}</span>
        <span>›</span>
        <span>聊天</span>
      </div>
      <SessionSelector />
      <ModelSelector />
    </div>
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-1.5 text-xs text-gray-500">
        <span
          class="w-2 h-2 rounded-full"
          :class="statusColor[connectionStore.status] ?? 'bg-gray-400'"
        />
        <span>{{ connectionStore.status === 'connected' ? '已连接' : connectionStore.status }}</span>
      </div>
    </div>
  </header>
</template>

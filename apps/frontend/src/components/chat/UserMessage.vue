<script setup lang="ts">
import type { ChatMessage } from '@/types/message'

defineProps<{ message: ChatMessage }>()

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function getTextContent(msg: ChatMessage): string {
  if (typeof msg.content === 'string') return msg.content
  return msg.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as any).text)
    .join('')
}
</script>

<template>
  <div class="flex justify-end gap-3">
    <div class="max-w-[70%]">
      <div class="bg-red-50 rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed">
        {{ getTextContent(message) }}
      </div>
      <div class="text-xs text-gray-400 mt-1 text-right">
        {{ formatTime(message.timestamp) }}
      </div>
    </div>
    <div class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
      <span class="text-red-500 text-xs">You</span>
    </div>
  </div>
</template>

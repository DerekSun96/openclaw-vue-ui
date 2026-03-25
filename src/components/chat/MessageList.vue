<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import type { ChatMessage, ToolCallState } from '@/types/message'
import UserMessage from './UserMessage.vue'
import AssistantMessage from './AssistantMessage.vue'
import ToolResultMessage from './ToolResultMessage.vue'

const props = defineProps<{
  messages: ChatMessage[]
  toolCalls: Map<string, ToolCallState>
  loading: boolean
}>()

const listRef = ref<HTMLDivElement>()

watch(
  () => props.messages.length,
  () => {
    nextTick(() => {
      if (listRef.value) {
        listRef.value.scrollTop = listRef.value.scrollHeight
      }
    })
  },
)
</script>

<template>
  <div ref="listRef" class="overflow-y-auto px-4 py-4 space-y-4" style="scroll-behavior: smooth">
    <div v-if="loading" class="flex justify-center py-8">
      <span class="ml-2 text-gray-400 text-sm">加载历史消息...</span>
    </div>
    <template v-for="msg in messages" :key="msg.id">
      <UserMessage v-if="msg.role === 'user'" :message="msg" />
      <ToolResultMessage v-else-if="msg.role === 'tool'" :message="msg" :tool-calls="toolCalls" />
      <AssistantMessage v-else :message="msg" :tool-calls="toolCalls" />
    </template>
  </div>
</template>

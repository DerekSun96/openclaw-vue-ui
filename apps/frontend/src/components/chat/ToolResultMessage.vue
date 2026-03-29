<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ChatMessage, ToolCallState } from '@/types/message'
import MarkdownRenderer from './MarkdownRenderer.vue'
import ChatToolChart from './ChatToolChart.vue'
import ChatToolTable from './ChatToolTable.vue'

const props = defineProps<{
  message: ChatMessage
  toolCalls: Map<string, ToolCallState>
}>()

const callExpanded = ref(false)
const outputExpanded = ref(false)

const toolCall = computed(() => {
  if (props.message.toolCallId) {
    return props.toolCalls.get(props.message.toolCallId)
  }
  return undefined
})

const isRunning = computed(() => toolCall.value?.status === 'running')
const toolName = computed(() => props.message.toolName ?? toolCall.value?.name ?? 'unknown')

const textContent = computed(() => {
  let text = ''
  if (typeof props.message.content === 'string') text = props.message.content
  else if (Array.isArray(props.message.content)) {
    text = props.message.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as any).text)
      .join('')
  }
  return text || toolCall.value?.output || ''
})

const parsedOutput = computed<Record<string, any> | null>(() => {
  if (!textContent.value) return null
  try {
    const parsed = JSON.parse(textContent.value)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
})

const isChartOutput = computed(() => parsedOutput.value?._type === 'chart')
const isTableOutput = computed(() => parsedOutput.value?._type === 'table')
const isStructuredOutput = computed(() => isChartOutput.value || isTableOutput.value)
const contentWidthClass = computed(() => (isStructuredOutput.value ? 'max-w-[80%] w-[80%]' : 'max-w-[80%]'))

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="flex gap-3">
    <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-1">
      <span class="text-gray-400 text-sm">⚙</span>
    </div>
    <div class="min-w-0 space-y-1.5" :class="contentWidthClass">
      <!-- Tool call card (input) -->
      <div
        class="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-gray-300 transition-colors"
        @click="!isRunning && (callExpanded = !callExpanded)"
      >
        <div class="flex items-center gap-2 px-3 py-2 text-sm">
          <span v-if="isRunning" class="relative flex h-2.5 w-2.5 flex-shrink-0">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
          </span>
          <span v-else class="text-orange-400 flex-shrink-0">✦</span>
          <span class="font-medium text-gray-700">1 tool {{ isRunning ? 'running' : 'call' }}</span>
          <span class="text-gray-400">{{ toolName }}</span>
          <span v-if="!isRunning" class="ml-auto text-gray-400 transition-transform text-xs" :class="{ 'rotate-180': callExpanded }">▾</span>
        </div>
        <div v-if="callExpanded && !isRunning && toolCall?.input" class="border-t border-gray-100 px-3 py-2">
          <pre class="text-xs text-gray-600 whitespace-pre-wrap overflow-x-auto">{{ JSON.stringify(toolCall.input, null, 2) }}</pre>
        </div>
      </div>

      <!-- Tool output card (result) -->
      <div
        v-if="!isRunning"
        class="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-gray-300 transition-colors"
        @click="outputExpanded = !outputExpanded"
      >
        <div class="flex items-center gap-2 px-3 py-2 text-sm">
          <span class="text-red-400 flex-shrink-0">✦</span>
          <span class="font-medium text-gray-700">Tool output</span>
          <span class="text-gray-400">{{ toolName }}</span>
          <span class="ml-auto text-gray-400 transition-transform text-xs" :class="{ 'rotate-180': outputExpanded }">▾</span>
        </div>
        <div v-if="outputExpanded" class="border-t border-gray-100 px-3 py-2">
          <ChatToolChart v-if="isChartOutput && textContent" :content="textContent" />
          <ChatToolTable v-else-if="isTableOutput && textContent" :content="textContent" />
          <div v-else-if="textContent" class="text-xs">
            <MarkdownRenderer :content="textContent" />
          </div>
          <div v-else class="text-xs text-gray-400 italic">No output</div>
        </div>
      </div>

      <div class="text-xs text-gray-400">
        Tool {{ formatTime(message.timestamp) }}
      </div>
    </div>
  </div>
</template>

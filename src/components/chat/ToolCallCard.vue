<script setup lang="ts">
import { ref } from 'vue'
import type { ToolCallState } from '@/types/message'

const props = defineProps<{
  toolCall: ToolCallState
}>()

const expanded = ref(false)

function getDescription(): string {
  const input = props.toolCall.input
  if (!input || typeof input !== 'object') return ''
  // Show file path for read/write tools
  const path = (input as any).file_path ?? (input as any).path ?? (input as any).filename ?? ''
  if (path) {
    const parts = String(path).split('/')
    return 'with from ' + parts.slice(-3).join('/')
  }
  // Show command for exec tools
  const cmd = (input as any).command ?? (input as any).cmd ?? ''
  if (cmd) return String(cmd).slice(0, 60)
  return ''
}

function getStatusLabel(): string {
  switch (props.toolCall.status) {
    case 'running': return 'Running...'
    case 'completed': return 'Completed'
    case 'error': return 'Error'
    default: return 'Pending'
  }
}
</script>

<template>
  <div
    class="border border-gray-200 rounded-lg bg-white cursor-pointer hover:border-gray-300 transition-colors"
    @click="expanded = !expanded"
  >
    <div class="flex items-center gap-2 px-3 py-2 text-xs">
      <span class="text-gray-400">📄</span>
      <span class="font-medium text-gray-700">{{ toolCall.name }}</span>
      <span v-if="toolCall.status === 'completed'" class="ml-auto text-green-500">✓</span>
      <span v-else-if="toolCall.status === 'running'" class="ml-auto">
        <span class="relative flex h-2.5 w-2.5">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
          <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
        </span>
      </span>
      <span v-else-if="toolCall.status === 'error'" class="ml-auto text-red-500">✕</span>
    </div>
    <div v-if="getDescription()" class="px-3 pb-1 text-xs text-gray-400 -mt-1">
      {{ getDescription() }}
    </div>
    <div class="px-3 pb-2 text-xs text-gray-400">
      {{ getStatusLabel() }}
    </div>
    <!-- Expanded output -->
    <div v-if="expanded" class="border-t border-gray-100 px-3 py-2 text-xs">
      <div v-if="toolCall.input && Object.keys(toolCall.input).length" class="mb-2">
        <div class="text-gray-500 mb-1">Input:</div>
        <pre class="bg-gray-50 rounded p-2 overflow-x-auto text-gray-600 whitespace-pre-wrap">{{ JSON.stringify(toolCall.input, null, 2) }}</pre>
      </div>
      <div v-if="toolCall.output">
        <div class="text-gray-500 mb-1">Output:</div>
        <pre class="bg-gray-50 rounded p-2 overflow-x-auto text-gray-600 whitespace-pre-wrap max-h-60 overflow-y-auto">{{ toolCall.output }}</pre>
      </div>
    </div>
  </div>
</template>

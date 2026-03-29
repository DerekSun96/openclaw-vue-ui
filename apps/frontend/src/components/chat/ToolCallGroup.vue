<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ContentBlock, ToolCallState } from '@/types/message'
import ToolCallCard from './ToolCallCard.vue'

const props = defineProps<{
  blocks: ContentBlock[]
  toolCalls: Map<string, ToolCallState>
}>()

const expanded = ref(false)

const toolUseBlocks = computed(() =>
  props.blocks
    .filter((block): block is Extract<ContentBlock, { type: 'tool_use' }> => block.type === 'tool_use')
    .map((block) => ({
      type: 'tool_use' as const,
      id: block.id,
      name: block.name,
      input: block.input,
    })),
)

const summary = computed(() => {
  const count = toolUseBlocks.value.length
  const names = [...new Set(toolUseBlocks.value.map((b) => b.name))]
  const nameStr = names.length <= 2 ? names.join(', ') : `${names[0]} +${names.length - 1}`
  return `${count} tool${count > 1 ? 's' : ''} ${nameStr}`
})

const hasRunning = computed(() =>
  toolUseBlocks.value.some((b) => props.toolCalls.get(b.id)?.status === 'running'),
)

function getToolCall(id: string): ToolCallState {
  return props.toolCalls.get(id) ?? { id, name: 'unknown', status: 'pending' }
}
</script>

<template>
  <div class="border border-gray-200 rounded-lg overflow-hidden">
    <!-- Summary header -->
    <div
      class="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors"
      @click="expanded = !expanded"
    >
      <span class="text-gray-300">•</span>
      <span v-if="hasRunning" class="relative flex h-2.5 w-2.5">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
        <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
      </span>
      <span v-else class="text-red-400">✦</span>
      <span class="font-medium text-gray-700">{{ summary }}</span>
      <span class="ml-auto text-gray-400 transition-transform text-xs" :class="{ 'rotate-180': expanded }">▾</span>
    </div>

    <!-- Expanded: individual tool cards -->
    <div v-if="expanded" class="border-t border-gray-100 p-3 space-y-2 bg-gray-50/50">
      <ToolCallCard
        v-for="block in toolUseBlocks"
        :key="block.id"
        :tool-call="getToolCall(block.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ usage: Record<string, unknown> }>()

function fmt(n: unknown): string {
  const num = Number(n)
  if (!num && num !== 0) return ''
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return String(num)
}

function getInput() { return fmt(props.usage.input ?? props.usage.input_tokens) }
function getOutput() { return fmt(props.usage.output ?? props.usage.output_tokens) }
function getCacheRead() { return fmt(props.usage.cacheRead ?? props.usage.cache_read) }
function getTotalTokens() { return fmt(props.usage.totalTokens) }
function getCtxPercent() {
  const total = Number(props.usage.totalTokens ?? 0)
  const ctx = Number(props.usage.contextTokens ?? 0)
  if (!ctx) return ''
  return Math.round((total / ctx) * 100) + '% ctx'
}
</script>

<template>
  <span class="inline-flex items-center gap-1 text-gray-400">
    <span v-if="getInput()">↑{{ getInput() }}</span>
    <span v-if="getOutput()">↓{{ getOutput() }}</span>
    <span v-if="getCacheRead()">R{{ getCacheRead() }}</span>
    <span v-if="getCtxPercent()">{{ getCtxPercent() }}</span>
  </span>
</template>

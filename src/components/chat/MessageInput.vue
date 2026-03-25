<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  disabled?: boolean
  streaming?: boolean
}>()

const emit = defineEmits<{
  send: [text: string]
}>()

const input = ref('')

const canSend = computed(() => input.value.trim().length > 0 && !props.disabled)

function handleSend() {
  if (!canSend.value) return
  emit('send', input.value.trim())
  input.value = ''
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}
</script>

<template>
  <div class="border-t border-gray-200 bg-white px-4 py-3">
    <div class="flex items-end max-w-4xl mx-auto">
      <div class="flex-1 flex items-center relative border border-gray-200 rounded-xl focus-within:border-red-300 focus-within:ring-1 focus-within:ring-red-200 bg-white">
        <textarea
          v-model="input"
          :disabled="disabled"
          :placeholder="disabled ? '等待连接...' : 'Message Assistant (Enter to send)'"
          rows="1"
          class="flex-1 resize-none border-none outline-none bg-transparent px-4 py-2.5 pr-2 text-sm disabled:text-gray-400"
          style="min-height: 40px; max-height: 160px"
          @keydown="handleKeydown"
          @input="($event.target as HTMLTextAreaElement).style.height = 'auto'; ($event.target as HTMLTextAreaElement).style.height = ($event.target as HTMLTextAreaElement).scrollHeight + 'px'"
        />
        <button
          :disabled="!canSend && !streaming"
          class="flex-shrink-0 mr-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          :class="canSend || streaming ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-100 text-gray-400'"
          @click="handleSend"
        >
          <span v-if="streaming" class="text-xs">■</span>
          <span v-else class="text-sm">↑</span>
        </button>
      </div>
    </div>
  </div>
</template>

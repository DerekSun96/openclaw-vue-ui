<script setup lang="ts">
import type { ChatMessage, ToolCallState } from "@/types/message";
import TokenStats from "./TokenStats.vue";
import MarkdownRenderer from "./MarkdownRenderer.vue";

const props = defineProps<{
  message: ChatMessage;
  toolCalls: Map<string, ToolCallState>;
}>();

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

function getTextBlocks(): string {
  if (typeof props.message.content === "string") return props.message.content;
  return props.message.content
    .filter((b) => b.type === "text")
    .map((b) => (b as any).text)
    .join("");
}
</script>

<template>
  <div class="flex gap-3">
    <div
      class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-1"
    >
      <span class="text-yellow-500 text-sm">★</span>
    </div>
    <div class="max-w-[80%] min-w-0">
      <!-- Text content -->
      <div
        v-if="getTextBlocks()"
        class="bg-gray-50 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-relaxed"
      >
        <MarkdownRenderer :content="getTextBlocks()" />
        <span
          v-if="message.pending"
          class="inline-block w-1.5 h-4 bg-gray-400 animate-pulse ml-0.5 align-middle"
        />
      </div>

      <!-- Waiting animation when pending but no content yet -->
      <div
        v-else-if="message.pending"
        class="bg-gray-50 rounded-2xl rounded-tl-sm px-4 py-3 inline-flex items-center gap-1"
      >
        <span
          class="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
          style="animation-delay: 0ms"
        />
        <span
          class="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
          style="animation-delay: 150ms"
        />
        <span
          class="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
          style="animation-delay: 300ms"
        />
      </div>

      <!-- Meta info -->
      <div class="flex items-center gap-2 mt-1 text-xs text-gray-400 flex-wrap">
        <span>Assistant</span>
        <span>{{ formatTime(message.timestamp) }}</span>
        <!-- <TokenStats v-if="message.usage" :usage="message.usage" /> -->
        <!-- <span v-if="message.model" class="text-gray-300">{{ message.model }}</span> -->
      </div>
    </div>
  </div>
</template>

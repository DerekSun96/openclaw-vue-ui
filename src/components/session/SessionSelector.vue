<script setup lang="ts">
import { useSessionsStore } from '@/stores/sessions'
import { useConnectionStore } from '@/stores/connection'
import { watch } from 'vue'

function formatTime(ts?: number): string {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const sessionsStore = useSessionsStore()
const connectionStore = useConnectionStore()

// Fetch sessions only after proxy is connected
watch(
  () => connectionStore.status,
  (s) => {
    if (s === 'connected') sessionsStore.fetchList()
  },
  { immediate: true },
)
</script>

<template>
  <el-select
    v-model="sessionsStore.currentId"
    placeholder="选择会话"
    size="small"
    style="width: 220px"
    @change="sessionsStore.selectSession"
  >
    <el-option
      v-for="s in sessionsStore.list"
      :key="s.id"
      :label="(s.label || s.id) + (s.updatedAt ? '  ' + formatTime(s.updatedAt) : '')"
      :value="s.id"
    />
  </el-select>
</template>

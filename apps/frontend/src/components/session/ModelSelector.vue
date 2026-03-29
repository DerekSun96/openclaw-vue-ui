<script setup lang="ts">
import { useSessionsStore } from '@/stores/sessions'
import { computed } from 'vue'

const sessionsStore = useSessionsStore()
const currentSession = computed(() =>
  sessionsStore.list.find((s) => s.id === sessionsStore.currentId),
)
</script>

<template>
  <el-tag v-if="currentSession?.model" size="small" type="info" effect="plain">
    {{ currentSession.model }}
  </el-tag>
</template>

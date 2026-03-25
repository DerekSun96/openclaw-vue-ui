<script setup lang="ts">
import { onMounted } from 'vue'
import { useConnectionStore } from '@/stores/connection'

const connectionStore = useConnectionStore()

onMounted(() => {
  connectionStore.connect()
})
</script>

<template>
  <RouterView />
</template>

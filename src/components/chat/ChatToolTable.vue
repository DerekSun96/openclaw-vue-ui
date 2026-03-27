<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  content: string
}>()

const parsedTable = computed<Record<string, any> | null>(() => {
  try {
    const parsed = JSON.parse(props.content)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
})

const columns = computed<string[]>(() => (
  Array.isArray(parsedTable.value?.columns) ? parsedTable.value.columns : []
))

const rows = computed<Record<string, unknown>[]>(() => {
  const tableRows = Array.isArray(parsedTable.value?.rows) ? parsedTable.value.rows : []
  return tableRows.map((row: unknown) => {
    const values = Array.isArray(row) ? row : []
    return columns.value.reduce<Record<string, unknown>>((record, column, index) => {
      record[column] = values[index] ?? ''
      return record
    }, {})
  })
})

const title = computed(() => {
  const rawTitle = parsedTable.value?.title?.text
  return typeof rawTitle === 'string' ? rawTitle : ''
})
</script>

<template>
  <div v-if="parsedTable" class="chat-tool-table">
    <div v-if="title" class="chat-tool-table__title">{{ title }}</div>
    <el-table :data="rows" stripe border size="small" max-height="420" style="width: 100%">
      <el-table-column
        v-for="column in columns"
        :key="column"
        :prop="column"
        :label="column"
        min-width="140"
        show-overflow-tooltip
      />
    </el-table>
  </div>
</template>

<style scoped>
.chat-tool-table {
  width: 100%;
  padding: 8px 0 4px;
}

.chat-tool-table__title {
  margin-bottom: 12px;
  text-align: center;
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}
</style>

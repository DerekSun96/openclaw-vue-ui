<template>
  <SidebarLayout>
    <div class="p-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">数据概览</h1>
        <p class="text-gray-500 text-sm mt-1">会话与 Token 使用统计</p>
      </div>

      <!-- Stats cards -->
      <div class="grid grid-cols-4 gap-4 mb-8">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
        >
          <div class="flex items-center gap-2 mb-3">
            <Icon :icon="stat.icon" class="text-lg" :style="{ color: stat.color }" />
            <span class="text-[14px] text-gray-500">{{ stat.label }}</span>
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
        </div>
      </div>

      <!-- Sessions table -->
      <div class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 class="text-sm font-semibold text-gray-700">会话列表</h2>
          <el-button size="small" text @click="sessions.fetchList()" :loading="sessions.loading">
            <Icon icon="mdi:refresh" class="text-gray-400" />
          </el-button>
        </div>

        <el-table
          :data="sessions.list"
          style="width: 100%"
          class="oc-table"
          empty-text="暂无数据"
          :loading="sessions.loading"
        >
          <el-table-column label="会话名称" min-width="200">
            <template #default="{ row }">
              <div class="flex items-center gap-2">
                <Icon icon="mdi:chat-outline" class="text-gray-400 flex-shrink-0" />
                <span class="text-sm text-gray-900 truncate">{{ row.label }}</span>
                <span v-if="row.updatedAt" class="text-[13px] text-gray-400 flex-shrink-0">{{ formatTime(row.updatedAt) }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="模型" width="180">
            <template #default="{ row }">
              <el-tag size="small" class="oc-tag">{{ row.model ?? '—' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="输入 Token（最后一轮）" width="200" align="right">
            <template #default="{ row }">
              <span class="text-sm text-gray-600">{{ row.inputTokens?.toLocaleString() ?? '—' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="输出 Token（最后一轮）" width="200" align="right">
            <template #default="{ row }">
              <span class="text-sm text-gray-600">{{ row.outputTokens?.toLocaleString() ?? '—' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="总 Token" width="120" align="right">
            <template #default="{ row }">
              <span class="text-sm text-gray-900 font-medium">{{ row.totalTokens?.toLocaleString() ?? '—' }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </SidebarLayout>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import SidebarLayout from '@/components/layout/SidebarLayout.vue'
import { useSessionsStore } from '@/stores/sessions'

const sessions = useSessionsStore()

function formatTime(ts: number | string): string {
  const d = new Date(typeof ts === 'string' ? Number(ts) : ts)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const stats = computed(() => {
  const total = sessions.list.length
  const totalInput = sessions.list.reduce((s, r) => s + (r.inputTokens ?? 0), 0)
  const totalOutput = sessions.list.reduce((s, r) => s + (r.outputTokens ?? 0), 0)
  const totalTokens = sessions.list.reduce((s, r) => s + (r.totalTokens ?? 0), 0)
  return [
    { label: '总会话数', value: total, icon: 'mdi:chat-outline', color: '#e74c3c' },
    { label: '输入 Token', value: totalInput.toLocaleString(), icon: 'mdi:arrow-right-circle-outline', color: '#3b82f6' },
    { label: '输出 Token', value: totalOutput.toLocaleString(), icon: 'mdi:arrow-left-circle-outline', color: '#10b981' },
    { label: '总 Token', value: totalTokens.toLocaleString(), icon: 'mdi:counter', color: '#f59e0b' },
  ]
})

onMounted(() => {
  if (sessions.list.length === 0) sessions.fetchList()
})
</script>

<style scoped>
:deep(.oc-table) {
  --el-table-bg-color: #ffffff;
  --el-table-tr-bg-color: #ffffff;
  --el-table-header-bg-color: #f9fafb;
  --el-table-row-hover-bg-color: #f9fafb;
  --el-table-border-color: #f3f4f6;
  --el-table-text-color: #374151;
  --el-table-header-text-color: #6b7280;
}
.oc-tag {
  background: #f3f4f6 !important;
  border-color: #e5e7eb !important;
  color: #6b7280 !important;
  font-size: 13px;
}
</style>

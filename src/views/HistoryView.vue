<template>
  <SidebarLayout>
    <div class="p-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">历史记录</h1>
        <p class="text-gray-500 text-sm mt-1">所有对话会话</p>
      </div>

      <!-- Search -->
      <div class="mb-6">
        <el-input
          v-model="search"
          placeholder="搜索会话..."
          size="large"
          class="oc-search"
          clearable
        >
          <template #prefix>
            <Icon icon="mdi:magnify" class="text-gray-400" />
          </template>
        </el-input>
      </div>

      <!-- List -->
      <div v-if="sessions.loading" class="text-gray-400 text-sm py-8 text-center">加载中...</div>
      <div v-else-if="filtered.length === 0" class="text-gray-400 text-sm py-8 text-center">
        {{ search ? '没有匹配的会话' : '暂无历史记录' }}
      </div>
      <div v-else class="space-y-2">
        <div
          v-for="s in filtered"
          :key="s.id"
          class="flex items-center gap-4 px-5 py-4 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all group"
          @click="goToChat(s.id)"
        >
          <div class="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Icon icon="mdi:chat-outline" class="text-gray-400" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm text-gray-900 font-medium truncate">{{ s.label }}<span v-if="s.updatedAt" class="text-xs text-gray-400 font-normal ml-2">{{ formatTime(s.updatedAt) }}</span></p>
            <div class="flex items-center gap-3 mt-0.5">
              <span class="text-xs text-gray-400">{{ s.model ?? '—' }}</span>
              <span v-if="s.totalTokens" class="text-xs text-gray-300">{{ s.totalTokens.toLocaleString() }} tokens</span>
            </div>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <Icon icon="mdi:chevron-right" class="text-gray-300 group-hover:text-gray-500 transition-colors" />
          </div>
        </div>
      </div>
    </div>
  </SidebarLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import SidebarLayout from '@/components/layout/SidebarLayout.vue'
import { useSessionsStore } from '@/stores/sessions'

const router = useRouter()
const sessions = useSessionsStore()
const search = ref('')

function formatTime(ts: number | string): string {
  const d = new Date(typeof ts === 'string' ? Number(ts) : ts)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const filtered = computed(() => {
  if (!search.value) return sessions.list
  const q = search.value.toLowerCase()
  return sessions.list.filter(s =>
    s.label.toLowerCase().includes(q) || (s.model ?? '').toLowerCase().includes(q)
  )
})

function goToChat(id: string) {
  sessions.selectSession(id)
  router.push('/chat')
}

onMounted(() => {
  if (sessions.list.length === 0) sessions.fetchList()
})
</script>

<style scoped>
:deep(.oc-search .el-input__wrapper) {
  background: #fff !important;
  border: 1px solid #e5e7eb;
  box-shadow: none !important;
}
:deep(.oc-search .el-input__wrapper:hover),
:deep(.oc-search .el-input__wrapper.is-focus) {
  border-color: var(--oc-primary);
  box-shadow: 0 0 0 1px var(--oc-primary);
}
:deep(.oc-search .el-input__inner) {
  color: #111827;
}
.oc-tag {
  background: #f3f4f6 !important;
  border-color: #e5e7eb !important;
  color: #6b7280 !important;
  font-size: 11px;
}
</style>

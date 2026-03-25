<template>
  <SidebarLayout>
    <div class="p-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Skills</h1>
        <p class="text-gray-500 text-sm mt-1">可用的 AI 技能与工具</p>
      </div>

      <!-- Filter tabs -->
      <div class="flex gap-2 mb-6">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors border"
          :class="activeTab === tab.value
            ? 'text-white border-transparent'
            : 'bg-white border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          :style="activeTab === tab.value ? { background: 'var(--oc-primary)', borderColor: 'var(--oc-primary)' } : {}"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Skills grid -->
      <div class="grid grid-cols-3 gap-4">
        <div
          v-for="skill in filteredSkills"
          :key="skill.name"
          class="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center" :style="{ background: skill.color + '18' }">
              <Icon :icon="skill.icon" class="text-xl" :style="{ color: skill.color }" />
            </div>
            <el-tag
              size="small"
              :class="skill.status === 'active' ? 'oc-tag-active' : 'oc-tag-inactive'"
            >
              {{ skill.status === 'active' ? '启用' : '未启用' }}
            </el-tag>
          </div>
          <h3 class="text-sm font-semibold text-gray-900 mb-1">{{ skill.name }}</h3>
          <p class="text-[13px] text-gray-400 leading-relaxed">{{ skill.desc }}</p>
          <div class="mt-3">
            <el-tag size="small" class="oc-tag-category">{{ skill.category }}</el-tag>
          </div>
        </div>
      </div>
    </div>
  </SidebarLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import SidebarLayout from '@/components/layout/SidebarLayout.vue'

const activeTab = ref('all')

const tabs = [
  { label: '全部', value: 'all' },
  { label: '已启用', value: 'active' },
  { label: '未启用', value: 'inactive' },
]

const skills = [
  { name: '代码执行', desc: '在沙箱环境中运行 Python、JS 等代码并返回结果', icon: 'mdi:code-braces', color: '#3b82f6', status: 'active', category: '开发' },
  { name: '网页搜索', desc: '实时搜索互联网获取最新信息', icon: 'mdi:web', color: '#10b981', status: 'active', category: '搜索' },
  { name: '文件读写', desc: '读取和写入本地文件系统中的文件', icon: 'mdi:file-outline', color: '#f59e0b', status: 'active', category: '文件' },
  { name: '数据库查询', desc: '连接数据库执行 SQL 查询并返回结果', icon: 'mdi:database-outline', color: '#8b5cf6', status: 'inactive', category: '数据' },
  { name: '图像生成', desc: '根据文字描述生成图像', icon: 'mdi:image-outline', color: '#ec4899', status: 'inactive', category: '创作' },
  { name: 'Shell 命令', desc: '在系统终端执行 Shell 命令', icon: 'mdi:console', color: '#e74c3c', status: 'active', category: '开发' },
  { name: 'HTTP 请求', desc: '发送 HTTP 请求调用外部 API', icon: 'mdi:api', color: '#06b6d4', status: 'active', category: '网络' },
  { name: '邮件发送', desc: '通过 SMTP 发送电子邮件', icon: 'mdi:email-outline', color: '#f97316', status: 'inactive', category: '通知' },
  { name: '日历管理', desc: '读取和创建日历事件', icon: 'mdi:calendar-outline', color: '#84cc16', status: 'inactive', category: '效率' },
]

const filteredSkills = computed(() => {
  if (activeTab.value === 'all') return skills
  return skills.filter(s => s.status === activeTab.value)
})
</script>

<style scoped>
.oc-tag-active {
  background: #f0fdf4 !important;
  border-color: #bbf7d0 !important;
  color: #16a34a !important;
  font-size: 13px;
}
.oc-tag-inactive {
  background: #f3f4f6 !important;
  border-color: #e5e7eb !important;
  color: #9ca3af !important;
  font-size: 13px;
}
.oc-tag-category {
  background: #f3f4f6 !important;
  border-color: #e5e7eb !important;
  color: #6b7280 !important;
  font-size: 13px;
}
</style>

<template>
  <SidebarLayout>
    <div class="p-8">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Skills</h1>
        <p class="text-gray-500 text-sm mt-1">显示当前 workspace 下的 Skills</p>
      </div>

      <div
        v-if="loading"
        class="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center text-sm text-gray-500"
      >
        正在加载 workspace Skills...
      </div>
      <div
        v-else-if="error"
        class="rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center text-sm text-red-500"
      >
        {{ error }}
      </div>
      <div
        v-else-if="skills.length === 0"
        class="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center text-sm text-gray-500"
      >
        当前 workspace 下暂无 Skills
      </div>
      <div v-else class="grid grid-cols-3 gap-4">
        <div
          v-for="skill in skills"
          :key="skill.id"
          class="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all"
        >
          <div class="flex items-center justify-between gap-4 mb-3">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" :style="{ background: skill.color + '18' }">
                <Icon :icon="skill.icon" class="text-xl" :style="{ color: skill.color }" />
              </div>
              <h3 class="text-sm font-semibold text-gray-900 truncate">{{ skill.name }}</h3>
            </div>
            <span class="skill-status" :class="skill.available ? 'skill-status--active' : 'skill-status--inactive'">
              <span class="skill-status-dot" />
              {{ skill.available ? '启用' : '未启用' }}
            </span>
          </div>
          <p class="text-[13px] text-gray-400 leading-relaxed min-h-[40px]">{{ skill.desc || '暂无描述' }}</p>
          <div class="mt-3 flex flex-wrap gap-2">
            <span v-if="skill.exampleRequest" class="skill-meta">示例请求</span>
          </div>
          <p v-if="skill.exampleRequest" class="text-xs text-gray-400 mt-2 leading-relaxed">
            示例：{{ skill.exampleRequest }}
          </p>
        </div>
      </div>

    </div>
  </SidebarLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import SidebarLayout from '@/components/layout/SidebarLayout.vue'
import type { OpenClawSkillSummary } from '@/types/openclaw'

interface SkillCard extends OpenClawSkillSummary {
  desc: string
  icon: string
  color: string
}

interface SkillsResponse {
  ok?: boolean
  error?: string
  workspace?: string
  skills?: OpenClawSkillSummary[]
}

const loading = ref(true)
const error = ref('')
const skills = ref<SkillCard[]>([])

function buildSkillCard(skill: OpenClawSkillSummary): SkillCard {
  return {
    ...skill,
    desc: skill.description || '',
    icon: skill.available ? 'mdi:lightning-bolt-outline' : 'mdi:lightning-bolt-off-outline',
    color: skill.available ? '#10b981' : '#9ca3af',
  }
}

async function fetchSkills() {
  loading.value = true
  error.value = ''

  try {
    const response = await fetch('/api/openclaw/skills')
    const payload = await response.json() as SkillsResponse

    if (!response.ok || payload?.ok === false) {
      throw new Error(payload?.error || '加载 Skills 失败')
    }

    skills.value = Array.isArray(payload.skills) ? payload.skills.map(buildSkillCard) : []
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载 Skills 失败'
    skills.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSkills()
})
</script>

<style scoped>
.skill-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 500;
}

.skill-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
}

.skill-status--active {
  color: #16a34a;
}

.skill-status--active .skill-status-dot {
  background: #22c55e;
}

.skill-status--inactive {
  color: #9ca3af;
}

.skill-status--inactive .skill-status-dot {
  background: #d1d5db;
}

.skill-meta {
  font-size: 12px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 9999px;
}
</style>

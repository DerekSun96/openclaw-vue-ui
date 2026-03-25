<template>
  <SidebarLayout>
    <div class="oc-page">
      <!-- Welcome -->
      <div class="oc-welcome">
        <div class="oc-welcome-text">
          <h1 class="oc-title">你好，欢迎回来</h1>
          <p class="oc-subtitle">今天想聊点什么？</p>
        </div>
        <button class="oc-new-btn" @click="router.push('/chat')">
          <Icon icon="mdi:plus" class="text-sm" />
          新建对话
        </button>
      </div>

      <!-- Quick actions -->
      <div class="oc-section">
        <h2 class="oc-section-title">快捷操作</h2>
        <div class="oc-actions-grid">
          <div
            v-for="action in quickActions"
            :key="action.label"
            class="oc-action-card"
            @click="action.onClick"
          >
            <div class="oc-action-icon" :style="{ background: action.bg }">
              <Icon :icon="action.icon" class="text-lg" :style="{ color: action.color }" />
            </div>
            <div>
              <p class="oc-action-label">{{ action.label }}</p>
              <p class="oc-action-desc">{{ action.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent sessions -->
      <div class="oc-section">
        <div class="oc-section-header">
          <h2 class="oc-section-title">最近会话</h2>
          <RouterLink to="/history" class="oc-more-link">查看全部</RouterLink>
        </div>

        <div v-if="sessions.loading" class="oc-empty">加载中...</div>
        <div v-else-if="sessions.list.length === 0" class="oc-empty">暂无会话</div>
        <div v-else class="oc-session-list">
          <div
            v-for="s in sessions.list.slice(0, 6)"
            :key="s.id"
            class="oc-session-item"
            @click="goToChat(s.id)"
          >
            <div class="oc-session-icon">
              <Icon icon="mdi:chat-outline" class="text-sm text-gray-400" />
            </div>
            <div class="oc-session-info">
              <p class="oc-session-name">{{ s.label }}<span v-if="s.updatedAt" class="oc-session-time">{{ formatTime(s.updatedAt) }}</span></p>
              <p class="oc-session-meta">{{ s.model ?? '—' }}</p>
            </div>
            <Icon icon="mdi:chevron-right" class="text-gray-300 text-base flex-shrink-0" />
          </div>
        </div>
      </div>
    </div>
  </SidebarLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { Icon } from '@iconify/vue'
import SidebarLayout from '@/components/layout/SidebarLayout.vue'
import { useSessionsStore } from '@/stores/sessions'

const router = useRouter()
const sessions = useSessionsStore()

function formatTime(ts: number | string): string {
  const d = new Date(typeof ts === 'string' ? Number(ts) : ts)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const quickActions = [
  { label: '新建对话', desc: '开始一次新的 AI 对话', icon: 'mdi:plus-circle-outline', color: '#e74c3c', bg: '#fff1f0', onClick: () => router.push('/chat') },
  { label: '历史记录', desc: '查看过去的对话记录', icon: 'mdi:history', color: '#2563eb', bg: '#eff6ff', onClick: () => router.push('/history') },
  { label: 'Skills', desc: '浏览可用的技能列表', icon: 'mdi:lightning-bolt-outline', color: '#d97706', bg: '#fffbeb', onClick: () => router.push('/skills') },
]

function goToChat(id: string) {
  sessions.selectSession(id)
  router.push('/chat')
}

onMounted(() => {
  if (sessions.list.length === 0) sessions.fetchList()
})
</script>

<style scoped>
.oc-page {
  padding: 28px 32px;
  max-width: 900px;
  margin: 0 auto;
}

.oc-welcome {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  padding: 24px 28px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.oc-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px;
}

.oc-subtitle {
  font-size: 13px;
  color: #999;
  margin: 0;
}

.oc-new-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #e74c3c;
  color: #fff;
  border: none;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;
}
.oc-new-btn:hover { opacity: 0.88; }

.oc-section { margin-bottom: 28px; }

.oc-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.oc-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #595959;
  margin: 0 0 12px;
}

.oc-section-header .oc-section-title { margin: 0; }

.oc-more-link {
  font-size: 14px;
  color: #e74c3c;
  text-decoration: none;
}
.oc-more-link:hover { opacity: 0.75; }

.oc-actions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.oc-action-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  cursor: pointer;
  transition: box-shadow 0.15s, border-color 0.15s, transform 0.15s;
}
.oc-action-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border-color: #e8e8e8;
  transform: translateY(-1px);
}

.oc-action-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.oc-action-label {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  margin: 0 0 2px;
}

.oc-action-desc {
  font-size: 14px;
  color: #aaa;
  margin: 0;
}

.oc-session-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.oc-session-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
  transition: box-shadow 0.12s, border-color 0.12s;
}
.oc-session-item:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border-color: #e8e8e8;
}

.oc-session-icon {
  width: 32px;
  height: 32px;
  border-radius: 7px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.oc-session-info { flex: 1; min-width: 0; }

.oc-session-name {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  margin: 0 0 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.oc-session-meta {
  font-size: 14px;
  color: #bbb;
  margin: 0;
}

.oc-session-time {
  font-size: 12px;
  color: #bbb;
  font-weight: 400;
  margin-left: 6px;
}

.oc-empty {
  font-size: 14px;
  color: #bbb;
  padding: 20px 0;
  text-align: center;
}
</style>

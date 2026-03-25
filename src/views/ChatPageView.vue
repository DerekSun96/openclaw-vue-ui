<template>
  <SidebarLayout>
    <div class="chat-page">
      <!-- 主体：左右两列，外层有 padding -->
      <div class="chat-body">
        <!-- 左侧 card：工具栏 + 聊天 -->
        <div class="left-card">
          <div class="chat-toolbar">
            <SessionSelector />
            <div class="toolbar-spacer" />
            <button class="new-chat-btn" @click="newChat">
              <Icon icon="mdi:plus" class="text-sm" />
              新建对话
            </button>
            <!-- <ModelSelector /> -->
          </div>
          <ChatView class="chat-content" />
        </div>

        <!-- 右侧列：两个独立 card，上下排列 -->
        <div class="right-col">
          <!-- Card 1：应用数据主题选项页 -->
          <div class="panel-card">
            <h3 class="panel-title">应用数据主题</h3>
            <div class="theme-grid">
              <div
                v-for="theme in dataThemes"
                :key="theme.id"
                class="theme-card"
                :class="{ 'theme-card--active': activeTheme === theme.id }"
                @click="activeTheme = theme.id"
              >
                <div class="theme-card-header">
                  <Icon :icon="theme.icon" class="theme-icon" />
                  <span class="theme-name">{{ theme.name }}</span>
                </div>
                <p class="theme-desc">{{ theme.desc }}</p>
              </div>
            </div>
          </div>

          <!-- Card 2：业务流程 Skills 目录 -->
          <div class="panel-card">
            <h3 class="panel-title">业务流程 Skills 目录</h3>
            <div class="skills-list">
              <div v-for="skill in skills" :key="skill.id" class="skill-item">
                <div class="skill-icon-wrap">
                  <Icon :icon="skill.icon" class="skill-icon" />
                </div>
                <div class="skill-info">
                  <p class="skill-name">{{ skill.name }}</p>
                  <p class="skill-desc">{{ skill.desc }}</p>
                </div>
                <div class="skill-right">
                  <span v-if="skill.available" class="skill-dot skill-dot--on" />
                  <span v-else class="skill-dot skill-dot--off" />
                  <Icon icon="mdi:chevron-right" class="skill-chevron" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </SidebarLayout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Icon } from "@iconify/vue";
import SidebarLayout from "@/components/layout/SidebarLayout.vue";
import SessionSelector from "@/components/session/SessionSelector.vue";
import ModelSelector from "@/components/session/ModelSelector.vue";
import ChatView from "@/components/chat/ChatView.vue";
import { useSessionsStore } from "@/stores/sessions";
import { useChatStore } from "@/stores/chat";

const sessionsStore = useSessionsStore();
const chatStore = useChatStore();

async function newChat() {
  chatStore.clearMessages();
  sessionsStore.createLocalSession();
}

const activeTheme = ref("research");

const dataThemes = [
  {
    id: "student",
    name: "学生数据",
    desc: "学生数据、批量性提报并生成数据",
    icon: "mdi:account-school-outline",
  },
  {
    id: "research",
    name: "科研数据",
    desc: "分析去年的科研能耗数据并生成总结",
    icon: "mdi:flask-outline",
  },
  {
    id: "energy",
    name: "能耗数据",
    desc: "能耗数据、能耗值、财务能耗数据",
    icon: "mdi:lightning-bolt-outline",
  },
  {
    id: "finance",
    name: "财务数据",
    desc: "数据集的财务数据、财务及服务数据",
    icon: "mdi:currency-cny",
  },
  {
    id: "purchase",
    name: "采购数据",
    desc: "采购数据、采购数据及新约数据数据",
    icon: "mdi:cart-outline",
  },
];

const skills = [
  {
    id: "overview",
    name: "数据概览",
    desc: "进行可能数据概括：数据概览",
    icon: "mdi:chart-bar",
    available: true,
  },
  {
    id: "anomaly",
    name: "异常分析",
    desc: "进行可数常分析，异常分析",
    icon: "mdi:alert-circle-outline",
    available: true,
  },
  {
    id: "report",
    name: "生成汇报",
    desc: "进行可能数据概览，生成汇报",
    icon: "mdi:file-chart-outline",
    available: true,
  },
  {
    id: "plan",
    name: "生成方案",
    desc: "进行可能生成方案、生成方案",
    icon: "mdi:lightbulb-outline",
    available: true,
  },
  {
    id: "approval",
    name: "流程审批建议",
    desc: "流程审批建议，可以给流程审批建议",
    icon: "mdi:account-check-outline",
    available: true,
  },
  {
    id: "breakdown",
    name: "任务拆解",
    desc: "任务选步骤组成的任务拆解",
    icon: "mdi:format-list-checks",
    available: false,
  },
];
</script>

<style scoped>
.chat-page {
  height: 100%;
  background: #f0f2f5;
  overflow: hidden;
}

.chat-body {
  display: flex;
  gap: 12px;
  padding: 12px;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

/* 左侧 card */
.left-card {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.chat-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.toolbar-spacer { flex: 1; }

.new-chat-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  background: #e74c3c;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;
}
.new-chat-btn:hover { opacity: 0.88; }
.new-chat-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.chat-content {
  flex: 1;
  overflow: hidden;
}

/* 右侧列 */
.right-col {
  width: 272px;
  min-width: 272px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
}

/* 右侧每个 card */
.panel-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 14px;
  max-height: 50vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-title {
  font-size: 15px;
  font-weight: 600;
  color: #595959;
  margin: 0 0 10px;
  flex-shrink: 0;
}

/* 数据主题网格 */
.theme-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  overflow-y: auto;
}

.theme-card {
  padding: 10px 10px 8px;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  cursor: pointer;
  transition:
    border-color 0.15s,
    box-shadow 0.15s,
    background 0.15s;
}

.theme-card:hover {
  border-color: #d0d0d0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}

.theme-card--active {
  border-color: #e74c3c;
  background: #fff8f7;
  box-shadow: 0 2px 8px rgba(231, 76, 60, 0.1);
}

.theme-card-header {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 4px;
}

.theme-icon {
  font-size: 14px;
  color: #8e8e93;
  flex-shrink: 0;
}

.theme-card--active .theme-icon {
  color: #e74c3c;
}

.theme-name {
  font-size: 13px;
  font-weight: 500;
  color: #1a1a1a;
}

.theme-desc {
  font-size: 11px;
  color: #aaa;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
}

/* Skills 列表 */
.skills-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}

.skill-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
  transition:
    box-shadow 0.12s,
    border-color 0.12s;
}

.skill-item:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  border-color: #e0e0e0;
}

.skill-icon-wrap {
  width: 30px;
  height: 30px;
  border-radius: 7px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.skill-icon {
  font-size: 15px;
  color: #8e8e93;
}

.skill-info {
  flex: 1;
  min-width: 0;
}

.skill-name {
  font-size: 13px;
  font-weight: 500;
  color: #1a1a1a;
  margin: 0 0 2px;
}

.skill-desc {
  font-size: 11px;
  color: #bbb;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.skill-right {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.skill-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.skill-dot--on {
  background: #22c55e;
}
.skill-dot--off {
  background: #d1d5db;
}

.skill-chevron {
  font-size: 14px;
  color: #d0d0d0;
}
</style>

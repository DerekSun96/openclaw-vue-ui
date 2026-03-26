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
          <ChatView :selected-themes="selectedThemes" class="chat-content" />
        </div>

        <!-- 右侧列：两个独立 card，上下排列 -->
        <div class="right-col">
          <DataThemePanel @selection-change="handleThemeSelection" />
          <BusinessSkillsPanel />
        </div>
      </div>
    </div>
  </SidebarLayout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Icon } from "@iconify/vue";
import SidebarLayout from "@/components/layout/SidebarLayout.vue";
import DataThemePanel from "@/components/chat/DataThemePanel.vue";
import BusinessSkillsPanel from "@/components/chat/BusinessSkillsPanel.vue";
import SessionSelector from "@/components/session/SessionSelector.vue";
import ChatView from "@/components/chat/ChatView.vue";
import { useSessionsStore } from "@/stores/sessions";
import { useChatStore } from "@/stores/chat";
import type { ThemeSelectionItem } from "@/types/library";

const sessionsStore = useSessionsStore();
const chatStore = useChatStore();
const selectedThemes = ref<ThemeSelectionItem[]>([]);

async function newChat() {
  chatStore.clearMessages();
  sessionsStore.createLocalSession();
}

function handleThemeSelection(themes: ThemeSelectionItem[]) {
  selectedThemes.value = themes;
}
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

.toolbar-spacer {
  flex: 1;
}

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
.new-chat-btn:hover {
  opacity: 0.88;
}
.new-chat-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

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
</style>

<template>
  <div class="oc-layout">
    <!-- Header -->
    <header class="oc-header">
      <div class="oc-header-left">
        <span class="oc-brand">
          <svg class="oc-brand-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- 灯塔 -->
            <path d="M12 2L10 6H14L12 2Z" fill="currentColor" opacity="0.9"/>
            <rect x="10.5" y="6" width="3" height="1.5" rx="0.5" fill="currentColor"/>
            <path d="M9 7.5L7 18H17L15 7.5H9Z" fill="currentColor" opacity="0.75"/>
            <path d="M9 7.5H15" stroke="white" stroke-width="0.6" opacity="0.5"/>
            <path d="M8.5 11H15.5" stroke="white" stroke-width="0.6" opacity="0.4"/>
            <path d="M8 14.5H16" stroke="white" stroke-width="0.6" opacity="0.3"/>
            <rect x="6" y="18" width="12" height="2" rx="1" fill="currentColor" opacity="0.85"/>
            <!-- 海浪 -->
            <path d="M3 21.5 Q5.5 20 8 21.5 Q10.5 23 13 21.5 Q15.5 20 18 21.5 Q20.5 23 23 21.5" stroke="currentColor" stroke-width="1.2" fill="none" opacity="0.6" stroke-linecap="round"/>
            <!-- 光芒 -->
            <line x1="12" y1="3.5" x2="8" y2="1" stroke="currentColor" stroke-width="0.8" opacity="0.5" stroke-linecap="round"/>
            <line x1="12" y1="3.5" x2="16" y2="1" stroke="currentColor" stroke-width="0.8" opacity="0.5" stroke-linecap="round"/>
            <line x1="12" y1="3.5" x2="12" y2="0.5" stroke="currentColor" stroke-width="0.8" opacity="0.5" stroke-linecap="round"/>
          </svg>
          {{ branding.appName }}
        </span>
        <button class="oc-collapse-btn" @click="collapsed = !collapsed">
          <Icon :icon="collapsed ? 'mdi:menu' : 'mdi:menu-open'" class="text-2xl" />
        </button>
      </div>
      <div class="oc-header-right">
        <el-dropdown trigger="hover" placement="bottom-end" popper-class="oc-user-dropdown-popper" @command="handleUserCommand">
          <button type="button" class="oc-user-trigger" aria-label="用户菜单">
            <span v-if="departmentName" class="oc-user-dept">
              <Icon icon="mdi:domain" class="oc-user-dept-icon" />
              <span class="oc-user-dept-text">{{ departmentName }}</span>
            </span>
            <span v-if="departmentName" class="oc-user-divider" aria-hidden="true" />
            <span class="oc-avatar">
              <el-avatar v-if="avatarUrl" :src="avatarUrl" :size="36" class="oc-el-avatar" />
              <el-avatar v-else :size="36" class="oc-el-avatar oc-el-avatar-fallback">
                <Icon icon="mdi:account-outline" class="text-gray-500 text-xl" />
              </el-avatar>
              <span class="oc-avatar-status" />
            </span>
            <span class="oc-user-name">{{ displayName }}</span>
            <Icon icon="mdi:chevron-down" class="oc-user-caret" />
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">
                <span class="oc-dropdown-item">
                  <Icon icon="mdi:logout" class="text-[16px]" />
                  退出登录
                </span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <div class="oc-body">
      <!-- Sidebar -->
      <aside class="oc-sidebar" :class="{ 'oc-sidebar-collapsed': collapsed }">
        <nav class="oc-nav">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="oc-nav-item"
            :class="{ 'oc-nav-active': isActive(item.to) }"
            :title="collapsed ? item.label : undefined"
          >
            <Icon :icon="item.icon" class="oc-nav-icon flex-shrink-0" />
            <span class="oc-nav-label">{{ item.label }}</span>
          </RouterLink>
        </nav>

        <!-- <div class="oc-sidebar-footer">
          <div class="oc-sidebar-footer-inner">
            <span class="oc-nav-label oc-footer-text">{{ branding.shortName }}</span>
          </div>
        </div> -->
      </aside>

      <!-- Main -->
      <main class="oc-main">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { Icon } from "@iconify/vue";
import { branding } from "@/config/branding";
import { useUserStore } from "@/stores/user";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const collapsed = ref(false);

const navItems = [
  // { to: '/home', icon: 'mdi:home-outline', label: '首页' },
  { to: "/chat", icon: "mdi:chat-outline", label: "对话" },
  { to: "/skills", icon: "mdi:lightning-bolt-outline", label: "Skills" },
  { to: "/history", icon: "mdi:history", label: "历史记录" },
  { to: "/data", icon: "mdi:chart-bar", label: "数据" },
];

function isActive(to: string) {
  return route.path === to || route.path.startsWith(to + "/");
}

const displayName = computed(() => userStore.username || "未命名用户");
const avatarUrl = computed(() => userStore.avatar || "");
const departmentName = computed(() => userStore.deptName || "");

async function handleUserCommand(command: string | number | object) {
  if (command !== "logout") return;

  await userStore.logout();
  await router.replace("/login");
}
</script>

<style scoped>
.oc-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
  font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
}

/* Header */
.oc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #ebebeb;
  flex-shrink: 0;
  z-index: 10;
  position: relative;
}

/* 底部细线装饰 */
.oc-header::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 20px;
  right: 20px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #e74c3c44, #e74c3c22, transparent);
}

.oc-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.oc-collapse-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  background: #fff;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.15s,
    color 0.15s,
    border-color 0.15s,
    box-shadow 0.15s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}
.oc-collapse-btn:hover {
  background: #fff;
  color: #e74c3c;
  border-color: #e74c3c44;
  box-shadow: 0 2px 6px rgba(231, 76, 60, 0.12);
}

.oc-brand {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.3px;
  background: linear-gradient(135deg, #1a1a1a 0%, #444 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  gap: 8px;
}

.oc-brand-icon {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  color: #e74c3c;
  -webkit-text-fill-color: initial;
  filter: drop-shadow(0 1px 3px rgba(231, 76, 60, 0.3));
}

.oc-header-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.oc-user-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  outline: none;
  border-radius: 0;
  background: transparent;
  padding: 0;
  color: #1f1f1f;
  cursor: pointer;
  transition:
    color 0.15s,
    opacity 0.15s;
}

.oc-user-trigger:hover {
  color: #111;
  opacity: 0.9;
}

.oc-user-dept {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 180px;
  min-width: 0;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--oc-primary) 18%, white);
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--oc-primary) 10%, white) 0%,
    color-mix(in srgb, var(--oc-primary) 6%, white) 100%
  );
  color: color-mix(in srgb, var(--oc-primary) 82%, #4a2a24);
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  box-shadow: 0 1px 2px color-mix(in srgb, var(--oc-primary) 10%, transparent);
}

.oc-user-dept-icon {
  flex-shrink: 0;
  font-size: 14px;
  color: var(--oc-primary);
}

.oc-user-dept-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.oc-user-divider {
  width: 1px;
  height: 16px;
  flex-shrink: 0;
  background: #ddd;
}

.oc-user-trigger:focus,
.oc-user-trigger:focus-visible,
.oc-user-trigger:active {
  outline: none;
  box-shadow: none;
}

.oc-user-name {
  max-width: 120px;
  overflow: hidden;
  color: #2f2a27;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.oc-avatar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: visible;
}

.oc-el-avatar {
  border: 1px solid #ededed;
  background: linear-gradient(135deg, #f7f7f7, #ececec);
}

.oc-el-avatar-fallback {
  color: #8c8c8c;
}

.oc-avatar-status {
  position: absolute;
  right: -1px;
  bottom: -1px;
  width: 10px;
  height: 10px;
  border: 2px solid #fff;
  border-radius: 50%;
  background: #42cfd0;
  box-shadow: 0 0 0 1px rgba(66, 207, 208, 0.08);
}

.oc-user-caret {
  color: #7f7974;
  font-size: 15px;
}

.oc-dropdown-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

:global(.oc-user-dropdown-popper .el-dropdown-menu) {
  min-width: 0;
}

:global(.oc-user-dropdown-popper .el-popper__arrow) {
  left: auto !important;
  right: 18px !important;
}

/* Body */
.oc-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Sidebar */
.oc-sidebar {
  width: 260px;
  min-width: 260px;
  background: #f8f9fa;
  border-right: 1px solid #ebebeb;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  transition:
    width 0.2s ease,
    min-width 0.2s ease;
  overflow: hidden;
  position: relative;
}

.oc-sidebar::after {
  content: "";
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  width: 1px;
  height: 60%;
  background: linear-gradient(to bottom, transparent, #e74c3c66, transparent);
  pointer-events: none;
}

.oc-sidebar-collapsed {
  width: 56px;
  min-width: 56px;
}

.oc-nav {
  flex: 1;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.oc-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  color: #595959;
  text-decoration: none;
  transition:
    background 0.15s,
    color 0.15s,
    box-shadow 0.15s,
    transform 0.15s;
  white-space: nowrap;
  overflow: hidden;
  position: relative;
}

.oc-nav-icon {
  font-size: 20px;
  color: #8e8e93;
  transition:
    color 0.15s,
    transform 0.15s;
  flex-shrink: 0;
}

.oc-nav-item:hover {
  background: #fff;
  color: #e74c3c;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  transform: translateX(3px);
}

.oc-nav-item:hover .oc-nav-icon,
.oc-nav-active .oc-nav-icon {
  color: #e74c3c;
}

.oc-nav-item:hover .oc-nav-icon {
  transform: scale(1.1);
}

.oc-nav-active {
  background: #fff !important;
  color: #e74c3c !important;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(231, 76, 60, 0.12) !important;
}

.oc-nav-label {
  overflow: hidden;
  opacity: 1;
  transition: opacity 0.15s ease;
}

.oc-sidebar-collapsed .oc-nav-label {
  opacity: 0;
  width: 0;
  overflow: hidden;
  display: none;
}

.oc-sidebar-collapsed .oc-nav {
  padding-left: 0;
  padding-right: 0;
}

.oc-sidebar-collapsed .oc-nav-item {
  justify-content: center;
  padding: 10px 0;
  width: 40px;
  margin: 0 auto;
}

.oc-sidebar-collapsed .oc-nav-item:hover {
  transform: none;
}

.oc-sidebar-collapsed .oc-sidebar-footer-inner {
  justify-content: center;
}

/* Footer */
.oc-sidebar-footer {
  padding: 10px;
  border-top: 1px solid #ebebeb;
}

.oc-sidebar-footer-inner {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #f0f0f0;
}

.oc-footer-text {
  font-size: 12px;
  color: #bbb;
}

/* Main */
.oc-main {
  flex: 1;
  overflow: auto;
  background: #ffffff;
}
</style>

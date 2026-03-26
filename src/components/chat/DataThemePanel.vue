<template>
  <div class="panel-card">
    <h3 class="panel-title">应用数据主题</h3>

    <div v-if="loading" class="theme-state">正在加载业务主题...</div>
    <div v-else-if="themes.length === 0" class="theme-state">当前部门暂无可用业务主题</div>
    <div v-else class="theme-grid">
      <el-tooltip
        v-for="theme in themes"
        :key="theme.id"
        placement="top"
        :show-after="300"
      >
        <template #content>
          <div class="theme-tooltip">
            <div class="theme-tooltip-title">{{ theme.name }}</div>
            <div v-if="theme.desc" class="theme-tooltip-desc">{{ theme.desc }}</div>
          </div>
        </template>
        <div
          class="theme-card"
          :class="{ 'theme-card--active': activeThemeIds.includes(theme.id) }"
          @click="toggleTheme(theme)"
        >
          <div class="theme-card-header">
            <Icon :icon="theme.icon" class="theme-icon" />
            <span class="theme-name">{{ theme.name }}</span>
          </div>
          <p v-if="theme.desc" class="theme-desc">{{ theme.desc }}</p>
        </div>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { computed, onMounted, ref, watch } from "vue";
import { libraryApis } from "@/apis/library.service";
import { useUserStore } from "@/stores/user";
import type { ThemeSelectionItem } from "@/types/library";

type ThemeItem = ThemeSelectionItem;

const props = defineProps<{
  clearSelectionVersion?: number;
}>();

const emit = defineEmits<{
  selectionChange: [themes: ThemeItem[]];
}>();

const userStore = useUserStore();
const loading = ref(false);
const themes = ref<ThemeItem[]>([]);
const activeThemeIds = ref<string[]>([]);

const themeIcons = [
  { keywords: ["学校", "校区"], icon: "mdi:school-outline" },
  { keywords: ["学生", "学工", "招生", "教学", "教务", "班级"], icon: "mdi:account-school-outline" },
  { keywords: ["科研", "课题", "论文", "实验", "学科", "学科点"], icon: "mdi:flask-outline" },
  { keywords: ["能耗", "能源", "水电", "电费"], icon: "mdi:lightning-bolt-outline" },
  { keywords: ["财务", "经费", "预算", "收费"], icon: "mdi:currency-cny" },
  { keywords: ["采购", "招采", "供应商"], icon: "mdi:cart-outline" },
  { keywords: ["委员会", "委员", "组织", "人事", "教师", "职工"], icon: "mdi:account-group-outline" },
  { keywords: ["院系", "学院"], icon: "mdi:domain" },
  { keywords: ["变更", "调整"], icon: "mdi:file-replace-outline" },
  { keywords: ["资产", "设备", "物资"], icon: "mdi:warehouse" },
  { keywords: ["安全", "安防", "告警"], icon: "mdi:shield-alert-outline" },
  { keywords: ["图书", "馆藏", "借阅"], icon: "mdi:bookshelf" },
  { keywords: ["宿舍", "后勤", "物业"], icon: "mdi:office-building-outline" },
];

const defaultThemeIcon = "mdi:database-outline";

const deptNo = computed(() => {
  const value = Number(userStore.deptId);
  return Number.isFinite(value) && value > 0 ? value : null;
});

function pickText(item: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = item[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return "";
}

function normalizeThemes(input: unknown): ThemeItem[] {
  const list = Array.isArray(input)
    ? input
    : Array.isArray((input as { list?: unknown[] })?.list)
      ? (input as { list: unknown[] }).list
      : Array.isArray((input as { records?: unknown[] })?.records)
        ? (input as { records: unknown[] }).records
        : [];

  return list
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map((item, index) => {
      const id =
        pickText(item, ["id", "themeId", "subThemeId", "viewId", "tableName", "themeCode"]) ||
        `theme-${index}`;
      const name =
        pickText(item, ["themeTitle", "themeName", "name", "viewName", "subThemeName", "title"]) ||
        `业务主题 ${index + 1}`;
      const desc = pickText(item, ["remarks", "description", "desc", "themeDesc", "summary"]);

      return {
        id,
        name,
        desc,
        icon: resolveThemeIcon(name),
      };
    });
}

function resolveThemeIcon(name: string) {
  const hit = themeIcons.find((item) => item.keywords.some((keyword) => name.includes(keyword)));
  return hit?.icon || defaultThemeIcon;
}

async function loadThemes() {
  if (!deptNo.value) {
    themes.value = [];
    activeThemeIds.value = [];
    emit("selectionChange", []);
    return;
  }

  loading.value = true;
  try {
    const { data } = await libraryApis.getDeptLibraryList(deptNo.value);
    const normalized = normalizeThemes(data);
    themes.value = normalized;
    activeThemeIds.value = activeThemeIds.value.filter((id) => normalized.some((item) => item.id === id));
    emitSelectedThemes();
  } finally {
    loading.value = false;
  }
}

function toggleTheme(theme: ThemeItem) {
  if (activeThemeIds.value.includes(theme.id)) {
    activeThemeIds.value = activeThemeIds.value.filter((id) => id !== theme.id);
  } else {
    activeThemeIds.value = [...activeThemeIds.value, theme.id];
  }
  emitSelectedThemes();
}

function emitSelectedThemes() {
  emit(
    "selectionChange",
    themes.value.filter((theme) => activeThemeIds.value.includes(theme.id)),
  );
}

watch(deptNo, () => {
  void loadThemes();
});

watch(
  () => props.clearSelectionVersion,
  () => {
    activeThemeIds.value = [];
    emit("selectionChange", []);
  },
);

onMounted(() => {
  void loadThemes();
});
</script>

<style scoped>
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

.theme-state {
  padding: 18px 10px;
  color: #8c8c8c;
  font-size: 13px;
  text-align: center;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  overflow-y: auto;
}

.theme-card {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
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
  border-color: var(--oc-primary);
  background: color-mix(in srgb, var(--oc-primary) 6%, white);
  box-shadow: 0 2px 8px color-mix(in srgb, var(--oc-primary) 12%, transparent);
}

.theme-card--active:hover {
  border-color: var(--oc-primary);
  background: color-mix(in srgb, var(--oc-primary) 6%, white);
  box-shadow: 0 2px 8px color-mix(in srgb, var(--oc-primary) 12%, transparent);
}

.theme-card-header {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 4px;
  min-width: 0;
}

.theme-icon {
  font-size: 14px;
  color: #8e8e93;
  flex-shrink: 0;
}

.theme-card--active .theme-icon {
  color: var(--oc-primary);
}

.theme-name {
  display: block;
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: #1a1a1a;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  word-break: break-all;
}

.theme-tooltip {
  max-width: 260px;
}

.theme-tooltip-title {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
}

.theme-tooltip-desc {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.5;
  color: #e5e7eb;
  word-break: break-all;
}
</style>

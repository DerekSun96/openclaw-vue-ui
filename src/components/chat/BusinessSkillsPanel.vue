<template>
  <div class="panel-card">
    <h3 class="panel-title">业务流程 Skills</h3>
    <div class="skills-list">
      <div v-if="loading" class="panel-state">正在加载 Skills...</div>
      <div v-else-if="error" class="panel-state panel-state--error">{{ error }}</div>
      <div v-else-if="skills.length === 0" class="panel-state">当前 workspace 下暂无可用 Skills</div>
      <el-tooltip
        v-for="skill in skills"
        :key="skill.id"
        placement="top"
        :show-after="300"
      >
        <template #content>
          <div class="skill-tooltip">
            <div class="skill-tooltip-title">{{ skill.name }}</div>
            <div v-if="skill.description" class="skill-tooltip-desc">{{ skill.description }}</div>
          </div>
        </template>
        <div class="skill-item" @click="handleSkillClick(skill)">
          <div class="skill-icon-wrap">
            <Icon icon="mdi:lightning-bolt-outline" class="skill-icon" />
          </div>
          <div class="skill-info">
            <p class="skill-name">{{ skill.name }}</p>
            <p class="skill-desc">{{ skill.description || "暂无描述" }}</p>
          </div>
          <div class="skill-right">
            <span v-if="skill.available" class="skill-dot skill-dot--on" />
            <span v-else class="skill-dot skill-dot--off" />
            <Icon icon="mdi:chevron-right" class="skill-chevron" />
          </div>
        </div>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Icon } from "@iconify/vue";
import type { OpenClawSkillSummary } from "@/types/openclaw";

const emit = defineEmits<{
  skillSelect: [exampleRequest: string];
}>();

const skills = ref<OpenClawSkillSummary[]>([]);
const loading = ref(true);
const error = ref("");

async function fetchSkills() {
  loading.value = true;
  error.value = "";

  try {
    const response = await fetch("/api/openclaw/skills");
    const payload = await response.json();

    if (!response.ok || payload?.ok === false) {
      throw new Error(payload?.error || "加载 Skills 失败");
    }

    skills.value = Array.isArray(payload?.skills) ? payload.skills : [];
  } catch (err) {
    error.value = err instanceof Error ? err.message : "加载 Skills 失败";
    skills.value = [];
  } finally {
    loading.value = false;
  }
}

function handleSkillClick(skill: OpenClawSkillSummary) {
  if (!skill.exampleRequest) return;
  emit("skillSelect", skill.exampleRequest);
}

onMounted(() => {
  fetchSkills();
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

.skills-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}

.panel-state {
  padding: 18px 12px;
  border: 1px dashed #e5e7eb;
  border-radius: 8px;
  background: #fafafa;
  color: #8c8c8c;
  font-size: 12px;
  line-height: 1.5;
  text-align: center;
}

.panel-state--error {
  color: #cf1322;
  background: #fff1f0;
  border-color: #ffccc7;
}

.skill-tooltip {
  max-width: 280px;
}

.skill-tooltip-title {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  line-height: 1.4;
}

.skill-tooltip-desc {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.82);
  white-space: normal;
  word-break: break-word;
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

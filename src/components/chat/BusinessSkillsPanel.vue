<template>
  <div class="panel-card">
    <h3 class="panel-title">业务流程 Skills</h3>
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
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";

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

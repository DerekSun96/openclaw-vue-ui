<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import * as echarts from 'echarts'

type ChartMode = 'bar' | 'line' | 'pie'

const props = defineProps<{
  content: string
}>()

type GenericRecord = Record<string, any>

const chartRef = ref<HTMLDivElement | null>(null)
const selectedChartType = ref<ChartMode>('bar')
let chartInstance: echarts.ECharts | null = null

const parsedOption = computed<GenericRecord | null>(() => {
  try {
    const parsed = JSON.parse(props.content)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
})

const defaultChartType = computed<ChartMode>(() => {
  const series = Array.isArray(parsedOption.value?.series) ? parsedOption.value?.series : []
  const firstSeriesType = series[0]?.type
  return firstSeriesType === 'bar' || firstSeriesType === 'line' || firstSeriesType === 'pie'
    ? firstSeriesType
    : 'bar'
})

const chartTypeOptions: Array<{ label: string; value: ChartMode }> = [
  { label: '柱状图', value: 'bar' },
  { label: '面积图', value: 'line' },
  { label: '饼图', value: 'pie' },
]

const resolvedOption = computed<GenericRecord | null>(() => {
  if (!parsedOption.value) return null

  const chartData = parsedOption.value._chartData
  if (!chartData) {
    const clean = { ...parsedOption.value }
    delete clean._type
    return clean
  }

  const xValues = Array.isArray(chartData.xValues) ? chartData.xValues : []
  const seriesData = Array.isArray(chartData.series) ? chartData.series : []
  const rawTitle = parsedOption.value.title?.text || ''

  if (selectedChartType.value === 'pie') {
    const pieColors = ['#60acfc', '#5bc4a0', '#f9c752', '#35c5eb', '#f7805c', '#d660a8', '#6a7bff', '#32d3a6']
    const pieData = xValues.map((x: string, i: number) => ({
      name: x,
      value: seriesData[0]?.data?.[i] ?? 0,
    }))
    return {
      title: { text: rawTitle, left: 'center', top: '2%', textStyle: { fontSize: 15, fontWeight: 600, color: '#1d2129' } },
      color: pieColors,
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
        backgroundColor: 'rgba(255,255,255,0.96)',
        borderColor: '#e5e6eb',
        textStyle: { color: '#1d2129', fontSize: 13 },
      },
      legend: {
        bottom: '2%',
        left: 'center',
        type: 'scroll',
        textStyle: { color: '#4e5969', fontSize: 13 },
        itemWidth: 14,
        itemHeight: 14,
        itemGap: 20,
        pageIconColor: '#4080ff',
        pageTextStyle: { color: '#86909c' },
      },
      series: [{
        name: seriesData[0]?.name ?? '',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '48%'],
        data: pieData,
        padAngle: 2,
        itemStyle: { borderRadius: 6 },
        label: {
          show: true,
          color: '#4e5969',
          fontSize: 13,
          formatter: '{b}',
          overflow: 'truncate',
          width: 80,
        },
        labelLine: {
          length: 16,
          length2: 20,
          lineStyle: { color: '#c9cdd4' },
        },
        emphasis: {
          scaleSize: 8,
          itemStyle: { shadowBlur: 16, shadowColor: 'rgba(0,0,0,0.12)' },
        },
      }],
    }
  }

  const colors = ['#60acfc', '#35c5eb', '#5bc4a0', '#f9c752', '#f7805c', '#d660a8', '#6a7bff']
  const isBar = selectedChartType.value === 'bar'

  const series = seriesData.map((seriesItem: GenericRecord, index: number) => {
    const baseColor = colors[index % colors.length] ?? '#60acfc'

    return {
      name: seriesItem.name,
      type: selectedChartType.value,
      data: Array.isArray(seriesItem.data) ? seriesItem.data : [],
      smooth: true,
      ...(isBar ? {
        barMaxWidth: 32,
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: baseColor },
            { offset: 1, color: `${baseColor}99` },
          ]),
        },
      } : {
        lineStyle: { width: 3 },
        symbol: 'none',
        smooth: 0.4,
        itemStyle: { color: baseColor },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: `${baseColor}cc` },
            { offset: 0.6, color: `${baseColor}40` },
            { offset: 1, color: `${baseColor}05` },
          ]),
        },
      }),
    }
  })

  return {
    title: { text: rawTitle, left: 'center', top: '2%', textStyle: { fontSize: 15, fontWeight: 600, color: '#1d2129' } },
    color: colors,
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: '#e5e6eb',
      textStyle: { color: '#1d2129', fontSize: 13 },
      axisPointer: { type: isBar ? 'shadow' : 'line', shadowStyle: { color: 'rgba(96,172,252,0.08)' } },
    },
    legend: { top: '10%', data: seriesData.map((item: GenericRecord) => item.name), textStyle: { color: '#86909c' } },
    grid: { top: '22%', left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: xValues,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#e5e6eb' } },
      axisLabel: { color: '#86909c', fontSize: 12 },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#86909c', fontSize: 12 },
      splitLine: { lineStyle: { type: 'dashed', color: '#e5e6eb' } },
    },
    series,
  }
})

function renderChart() {
  if (!resolvedOption.value || !chartRef.value) return
  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }
  chartInstance.setOption(resolvedOption.value, true)
}

function handleResize() {
  chartInstance?.resize()
}

function selectChartType(type: ChartMode) {
  selectedChartType.value = type
}

watch(defaultChartType, (type) => {
  selectedChartType.value = type
}, { immediate: true })

watch(resolvedOption, async () => {
  await nextTick()
  renderChart()
}, { deep: true })

onMounted(() => {
  renderChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  chartInstance?.dispose()
  chartInstance = null
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div v-if="parsedOption" class="chat-tool-chart">
    <div class="chart-toolbar">
      <button
        v-for="option in chartTypeOptions"
        :key="option.value"
        type="button"
        class="chart-type-btn"
        :class="{ 'chart-type-btn--active': selectedChartType === option.value }"
        @click.stop="selectChartType(option.value)"
      >
        {{ option.label }}
      </button>
    </div>
    <div ref="chartRef" class="echart-container" />
  </div>
</template>

<style scoped>
.chat-tool-chart {
  width: 100%;
  min-height: 280px;
  padding: 8px 0 4px;
}

.chart-toolbar {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 10px;
}

.chart-type-btn {
  border: 1px solid #dbe2ea;
  background: #fff;
  color: #6b7280;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
  line-height: 1.2;
  cursor: pointer;
  transition:
    color 0.15s ease,
    background-color 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.chart-type-btn:hover {
  border-color: #60acfc;
  color: #60acfc;
}

.chart-type-btn--active {
  background: rgba(96, 172, 252, 0.12);
  border-color: #60acfc;
  color: #60acfc;
  box-shadow: inset 0 0 0 1px rgba(96, 172, 252, 0.18);
}

.echart-container {
  width: 100%;
  height: 400px;
}
</style>

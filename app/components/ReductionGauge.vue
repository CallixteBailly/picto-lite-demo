<template>
  <div class="reduction-gauge">
    <span class="gauge-label" :style="{ color: gaugeColor }">-{{ percent }}%</span>
    <div class="gauge-track">
      <div
        class="gauge-fill"
        :style="{
          width: animatedWidth + '%',
          backgroundColor: gaugeColor,
          transitionDelay: delay + 'ms',
        }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  percent: number
  delay: number
}>()

const animatedWidth = ref(0)

const gaugeColor = computed(() => {
  const p = props.percent
  if (p >= 60) return '#16a34a'
  if (p >= 20) return '#4ade80'
  if (p > 0) return '#f59e0b'
  return '#d1d5db'
})

onMounted(() => {
  nextTick(() => {
    animatedWidth.value = props.percent
  })
})
</script>

<style scoped>
.reduction-gauge {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.gauge-label {
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 40px;
  text-align: right;
  white-space: nowrap;
}

.gauge-track {
  width: 120px;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.gauge-fill {
  height: 100%;
  border-radius: 4px;
  width: 0;
  transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
</style>

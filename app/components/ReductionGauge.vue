<template>
  <div class="reduction-gauge">
    <div class="reduction-gauge-label">-{{ clampedPercent }}%</div>
    <div class="reduction-gauge-track">
      <div
        class="reduction-gauge-fill"
        :class="gaugeClass"
        :style="{ width: animatedWidth, transitionDelay: `${delay}ms` }" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    percent: number
    delay?: number
  }>(),
  { delay: 0 }
)

const clampedPercent = computed(() =>
  Math.max(0, Math.min(100, props.percent))
)

const gaugeClass = computed(() => {
  if (clampedPercent.value >= 60) return 'gauge-great'
  if (clampedPercent.value >= 20) return 'gauge-good'
  if (clampedPercent.value > 0) return 'gauge-moderate'
  return 'gauge-none'
})

const animatedWidth = ref('0%')
let rafId: number | null = null

onMounted(() => {
  rafId = requestAnimationFrame(() => {
    animatedWidth.value = `${clampedPercent.value}%`
  })
})

onBeforeUnmount(() => {
  if (rafId !== null) cancelAnimationFrame(rafId)
})
</script>

<style lang="scss" scoped>
.reduction-gauge {
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.reduction-gauge-label {
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 40px;
  text-align: right;
  color: $dark-grey-color;
}

.reduction-gauge-track {
  flex: 1;
  height: 6px;
  background: $light-grey-color;
  border-radius: 3px;
  overflow: hidden;
}

.reduction-gauge-fill {
  height: 100%;
  width: 0%;
  border-radius: 3px;
  transition: width 0.6s ease-out;

  &.gauge-great {
    background: #22c55e;
  }

  &.gauge-good {
    background: #86efac;
  }

  &.gauge-moderate {
    background: #f59e0b;
  }

  &.gauge-none {
    background: $grey-color;
  }
}
</style>

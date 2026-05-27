<template>
  <div class="reduction-gauge" :style="{ animationDelay: `${delay}ms` }">
    <span class="gauge-label" :class="colorClass">{{ label }}</span>
    <div class="gauge-track">
      <div
        class="gauge-fill"
        :class="colorClass"
        :style="{ width: animatedWidth }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  originalSize: number
  optimizedSize: number
  delay?: number
}>()

const animatedPercent = ref(0)

const percent = computed(() =>
  Math.max(0, Math.round((1 - props.optimizedSize / props.originalSize) * 100))
)

const label = computed(() => `-${percent.value}%`)

const colorClass = computed(() => {
  if (percent.value >= 60) return 'gauge-excellent'
  if (percent.value >= 20) return 'gauge-good'
  if (percent.value > 0) return 'gauge-moderate'
  return 'gauge-none'
})

const animatedWidth = computed(() => `${animatedPercent.value}%`)

onMounted(() => {
  const duration = 600
  const start = performance.now()

  function tick(now: number) {
    const elapsed = now - start
    const progress = Math.min(elapsed / duration, 1)
    // easeOutCubic
    const eased = 1 - Math.pow(1 - progress, 3)
    animatedPercent.value = Math.round(eased * percent.value)

    if (progress < 1) {
      requestAnimationFrame(tick)
    }
  }

  // Respect delay before starting animation
  setTimeout(() => requestAnimationFrame(tick), props.delay ?? 0)
})
</script>

<style scoped>
.reduction-gauge {
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0;
  animation: gauge-fade-in 0.3s ease forwards;
}

@keyframes gauge-fade-in {
  to {
    opacity: 1;
  }
}

.gauge-label {
  font-size: 0.8rem;
  font-weight: 700;
  min-width: 42px;
  text-align: right;
  white-space: nowrap;
}

.gauge-track {
  flex: 1;
  height: 6px;
  background: var(--gauge-track-bg, #e5e7eb);
  border-radius: 3px;
  overflow: hidden;
}

.gauge-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.05s linear;
}

.gauge-excellent {
  color: #059669;
}
.gauge-excellent .gauge-fill,
.gauge-fill.gauge-excellent {
  background: linear-gradient(90deg, #34d399, #059669);
}

.gauge-good {
  color: #16a34a;
}
.gauge-good .gauge-fill,
.gauge-fill.gauge-good {
  background: linear-gradient(90deg, #86efac, #22c55e);
}

.gauge-moderate {
  color: #d97706;
}
.gauge-moderate .gauge-fill,
.gauge-fill.gauge-moderate {
  background: linear-gradient(90deg, #fcd34d, #f59e0b);
}

.gauge-none {
  color: #9ca3af;
}
.gauge-none .gauge-fill,
.gauge-fill.gauge-none {
  background: #d1d5db;
}
</style>

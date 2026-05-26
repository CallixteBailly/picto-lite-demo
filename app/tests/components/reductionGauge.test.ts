import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ReductionGauge from '@/components/ReductionGauge.vue'

describe('ReductionGauge component', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders correctly', async () => {
    const wrapper = await mountSuspended(ReductionGauge, {
      props: { percent: 50 },
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.reduction-gauge').exists()).toBe(true)
  })

  it('displays the clamped percent in the label', async () => {
    const wrapper = await mountSuspended(ReductionGauge, {
      props: { percent: 45 },
    })

    expect(wrapper.find('.reduction-gauge-label').text()).toBe('-45%')
  })

  it('clamps negative percent to 0', async () => {
    const wrapper = await mountSuspended(ReductionGauge, {
      props: { percent: -15 },
    })

    expect(wrapper.find('.reduction-gauge-label').text()).toBe('-0%')
    expect(wrapper.find('.reduction-gauge-fill').classes()).toContain(
      'gauge-none'
    )
  })

  it('clamps percent above 100 to 100', async () => {
    const wrapper = await mountSuspended(ReductionGauge, {
      props: { percent: 150 },
    })

    expect(wrapper.find('.reduction-gauge-label').text()).toBe('-100%')
  })

  it('applies gauge-great class for percent >= 60', async () => {
    const wrapper = await mountSuspended(ReductionGauge, {
      props: { percent: 75 },
    })

    expect(wrapper.find('.reduction-gauge-fill').classes()).toContain(
      'gauge-great'
    )
  })

  it('applies gauge-good class for percent >= 20 and < 60', async () => {
    const wrapper = await mountSuspended(ReductionGauge, {
      props: { percent: 35 },
    })

    expect(wrapper.find('.reduction-gauge-fill').classes()).toContain(
      'gauge-good'
    )
  })

  it('applies gauge-moderate class for percent > 0 and < 20', async () => {
    const wrapper = await mountSuspended(ReductionGauge, {
      props: { percent: 10 },
    })

    expect(wrapper.find('.reduction-gauge-fill').classes()).toContain(
      'gauge-moderate'
    )
  })

  it('applies gauge-none class for percent = 0', async () => {
    const wrapper = await mountSuspended(ReductionGauge, {
      props: { percent: 0 },
    })

    expect(wrapper.find('.reduction-gauge-fill').classes()).toContain(
      'gauge-none'
    )
  })

  it('applies the delay as transitionDelay style', async () => {
    const wrapper = await mountSuspended(ReductionGauge, {
      props: { percent: 50, delay: 160 },
    })

    const fill = wrapper.find('.reduction-gauge-fill')
    expect(fill.attributes('style')).toContain('transition-delay: 160ms')
  })

  it('starts with width 0% before animation', async () => {
    const wrapper = await mountSuspended(ReductionGauge, {
      props: { percent: 50 },
    })

    const fill = wrapper.find('.reduction-gauge-fill')
    expect(fill.attributes('style')).toContain('width: 0%')
  })

  it('uses default delay of 0ms when not provided', async () => {
    const wrapper = await mountSuspended(ReductionGauge, {
      props: { percent: 50 },
    })

    const fill = wrapper.find('.reduction-gauge-fill')
    expect(fill.attributes('style')).toContain('transition-delay: 0ms')
  })
})

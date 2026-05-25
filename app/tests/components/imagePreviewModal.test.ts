import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ImagePreviewModal from '@/components/ImagePreviewModal.vue'
import type { ResultItem } from '~/types/result'
import type { VueWrapper } from '@vue/test-utils'

const waitForPromises = (): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, 0))

function createResultItem(overrides: Partial<ResultItem> = {}): ResultItem {
  return {
    id: 'test-id',
    name: 'test-image.png',
    blob: new Blob([new Uint8Array(1_500)], { type: 'image/png' }),
    originalBlob: new Blob([new Uint8Array(3_000)], { type: 'image/png' }),
    originalSize: 3_000,
    optimizedSize: 1_500,
    success: true,
    ...overrides,
  }
}

describe('ImagePreviewModal component', () => {
  let wrapper: VueWrapper<InstanceType<typeof ImagePreviewModal>>

  beforeEach(() => {
    vi.resetAllMocks()

    globalThis.URL.createObjectURL = vi.fn(() => 'blob:fake-url')
    globalThis.URL.revokeObjectURL = vi.fn()

    document.body.style.overflow = ''
  })

  afterEach(() => {
    wrapper?.unmount()
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove())
  })

  it('renders correctly with item prop', async () => {
    const item = createResultItem()
    wrapper = await mountSuspended(ImagePreviewModal, {
      props: { item },
      attachTo: document.body,
    })

    expect(wrapper.exists()).toBe(true)

    const backdrop = document.querySelector('.modal-backdrop')
    expect(backdrop).not.toBeNull()
  })

  it('displays the image name in the modal title', async () => {
    const item = createResultItem({ name: 'photo.jpg' })
    wrapper = await mountSuspended(ImagePreviewModal, {
      props: { item },
      attachTo: document.body,
    })

    const title = document.querySelector('.modal-title')
    expect(title?.textContent).toBe('photo.jpg')
  })

  it('shows close button with correct label', async () => {
    const item = createResultItem()
    wrapper = await mountSuspended(ImagePreviewModal, {
      props: { item },
      attachTo: document.body,
    })

    const closeButton = document.querySelector('.close-button')
    expect(closeButton).not.toBeNull()
    expect(closeButton?.textContent).toBe(
      useNuxtApp().$i18n.t('components.image_preview_modal.close_label')
    )
  })

  it('displays info bar with original and optimized labels', async () => {
    const item = createResultItem()
    wrapper = await mountSuspended(ImagePreviewModal, {
      props: { item },
      attachTo: document.body,
    })

    const labels = document.querySelectorAll('.info-label')
    expect(labels).toHaveLength(2)
    expect(labels[0]?.textContent?.trim()).toBe(
      useNuxtApp().$i18n.t('components.image_preview_modal.original_label')
    )
    expect(labels[1]?.textContent?.trim()).toBe(
      useNuxtApp().$i18n.t('components.image_preview_modal.optimized_label')
    )
  })

  it('displays original and optimized sizes in info bar', async () => {
    const item = createResultItem({ originalSize: 3_000, optimizedSize: 1_500 })
    wrapper = await mountSuspended(ImagePreviewModal, {
      props: { item },
      attachTo: document.body,
    })

    const sizes = document.querySelectorAll('.info-size')
    expect(sizes).toHaveLength(2)
    expect(sizes[0]?.textContent?.trim()).toBe('2.9 KB')
    expect(sizes[1]?.textContent?.trim()).toBe('1.5 KB')
  })

  it('shows dimensions after images load', async () => {
    const item = createResultItem()
    wrapper = await mountSuspended(ImagePreviewModal, {
      props: { item },
      attachTo: document.body,
    })

    const originalImg = document.querySelector<HTMLImageElement>(
      '.image-layer-original img'
    )
    const optimizedImg =
      document.querySelector<HTMLImageElement>('.image-layer-optimized')

    expect(originalImg).not.toBeNull()
    expect(optimizedImg).not.toBeNull()

    Object.defineProperty(originalImg!, 'naturalWidth', {
      value: 1920,
      configurable: true,
    })
    Object.defineProperty(originalImg!, 'naturalHeight', {
      value: 1080,
      configurable: true,
    })
    Object.defineProperty(optimizedImg!, 'naturalWidth', {
      value: 1920,
      configurable: true,
    })
    Object.defineProperty(optimizedImg!, 'naturalHeight', {
      value: 1080,
      configurable: true,
    })
    Object.defineProperty(optimizedImg!, 'offsetWidth', {
      value: 800,
      configurable: true,
    })

    originalImg?.dispatchEvent(new Event('load'))
    optimizedImg?.dispatchEvent(new Event('load'))
    await waitForPromises()

    const dims = document.querySelectorAll('.info-dims')
    expect(dims).toHaveLength(2)
    expect(dims[0]?.textContent?.trim()).toBe('1920 × 1080')
    expect(dims[1]?.textContent?.trim()).toBe('1920 × 1080')
  })

  it('does not show dimensions before images load', async () => {
    const item = createResultItem()
    wrapper = await mountSuspended(ImagePreviewModal, {
      props: { item },
      attachTo: document.body,
    })

    const dims = document.querySelectorAll('.info-dims')
    expect(dims).toHaveLength(0)
  })

  it('creates object URLs for original and optimized blobs on mount', async () => {
    const item = createResultItem()
    wrapper = await mountSuspended(ImagePreviewModal, {
      props: { item },
      attachTo: document.body,
    })

    expect(URL.createObjectURL).toHaveBeenCalledTimes(2)
    expect(URL.createObjectURL).toHaveBeenCalledWith(item.originalBlob)
    expect(URL.createObjectURL).toHaveBeenCalledWith(item.blob)
  })

  it('sets optimized and original image sources', async () => {
    const item = createResultItem()
    wrapper = await mountSuspended(ImagePreviewModal, {
      props: { item },
      attachTo: document.body,
    })

    const optimizedImg =
      document.querySelector<HTMLImageElement>('.image-layer-optimized')
    const originalImg = document.querySelector<HTMLImageElement>(
      '.image-layer-original img'
    )

    expect(optimizedImg?.src).toBe('blob:fake-url')
    expect(originalImg?.src).toBe('blob:fake-url')
  })

  it('sets correct alt text on images', async () => {
    const item = createResultItem()
    wrapper = await mountSuspended(ImagePreviewModal, {
      props: { item },
      attachTo: document.body,
    })

    const optimizedImg =
      document.querySelector<HTMLImageElement>('.image-layer-optimized')
    const originalImg = document.querySelector<HTMLImageElement>(
      '.image-layer-original img'
    )

    expect(optimizedImg?.alt).toBe(
      useNuxtApp().$i18n.t('components.image_preview_modal.optimized_label')
    )
    expect(originalImg?.alt).toBe(
      useNuxtApp().$i18n.t('components.image_preview_modal.original_label')
    )
  })

  it('revokes object URLs on unmount', async () => {
    const item = createResultItem()
    wrapper = await mountSuspended(ImagePreviewModal, {
      props: { item },
      attachTo: document.body,
    })

    const revokeCalls = (URL.revokeObjectURL as ReturnType<typeof vi.fn>).mock.calls.length
    expect(revokeCalls).toBe(0)

    wrapper.unmount()

    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2)
  })

  it('sets body overflow to hidden on mount', async () => {
    const item = createResultItem()
    wrapper = await mountSuspended(ImagePreviewModal, {
      props: { item },
      attachTo: document.body,
    })

    expect(document.body.style.overflow).toBe('hidden')
  })

  it('restores body overflow on unmount', async () => {
    const item = createResultItem()
    wrapper = await mountSuspended(ImagePreviewModal, {
      props: { item },
      attachTo: document.body,
    })

    expect(document.body.style.overflow).toBe('hidden')

    wrapper.unmount()

    expect(document.body.style.overflow).toBe('')
  })

  it('emits close when close button is clicked', async () => {
    const item = createResultItem()
    wrapper = await mountSuspended(ImagePreviewModal, {
      props: { item },
      attachTo: document.body,
    })

    const closeButton = document.querySelector('.close-button') as HTMLButtonElement
    closeButton.click()
    await waitForPromises()

    expect(wrapper.emitted('close')).toBeTruthy()
    expect(wrapper.emitted('close')!.length).toBe(1)
  })

  it('emits close when backdrop is clicked', async () => {
    const item = createResultItem()
    wrapper = await mountSuspended(ImagePreviewModal, {
      props: { item },
      attachTo: document.body,
    })

    const backdrop = document.querySelector('.modal-backdrop') as HTMLElement
    backdrop.click()
    await waitForPromises()

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('does not emit close when modal content is clicked', async () => {
    const item = createResultItem()
    wrapper = await mountSuspended(ImagePreviewModal, {
      props: { item },
      attachTo: document.body,
    })

    const content = document.querySelector('.modal-content') as HTMLElement
    content.click()
    await waitForPromises()

    expect(wrapper.emitted('close')).toBeFalsy()
  })

  it('emits close on Escape key', async () => {
    const item = createResultItem()
    wrapper = await mountSuspended(ImagePreviewModal, {
      props: { item },
      attachTo: document.body,
    })

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await waitForPromises()

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('renders the comparison container with both image layers', async () => {
    const item = createResultItem()
    wrapper = await mountSuspended(ImagePreviewModal, {
      props: { item },
      attachTo: document.body,
    })

    const container = document.querySelector('.comparison-container')
    expect(container).not.toBeNull()

    const optimizedLayer =
      document.querySelector('.image-layer-optimized')
    const originalLayer =
      document.querySelector('.image-layer-original')
    expect(optimizedLayer).not.toBeNull()
    expect(originalLayer).not.toBeNull()
  })

  it('renders the slider handle with correct aria attributes', async () => {
    const item = createResultItem()
    wrapper = await mountSuspended(ImagePreviewModal, {
      props: { item },
      attachTo: document.body,
    })

    const handle = document.querySelector('.slider-handle') as HTMLElement
    expect(handle).not.toBeNull()
    expect(handle.getAttribute('role')).toBe('slider')
    expect(handle.getAttribute('tabindex')).toBe('0')
    expect(handle.getAttribute('aria-valuemin')).toBe('0')
    expect(handle.getAttribute('aria-valuemax')).toBe('100')
    expect(handle.getAttribute('aria-label')).toBe(
      useNuxtApp().$i18n.t('components.image_preview_modal.slider_hint')
    )
  })

  it('renders floating labels for before and after', async () => {
    const item = createResultItem()
    wrapper = await mountSuspended(ImagePreviewModal, {
      props: { item },
      attachTo: document.body,
    })

    const labelBefore = document.querySelector('.label-before')
    const labelAfter = document.querySelector('.label-after')
    expect(labelBefore).not.toBeNull()
    expect(labelAfter).not.toBeNull()
    expect(labelBefore?.textContent?.trim()).toBe(
      useNuxtApp().$i18n.t(
        'components.image_preview_modal.original_short_label'
      )
    )
    expect(labelAfter?.textContent?.trim()).toBe(
      useNuxtApp().$i18n.t(
        'components.image_preview_modal.optimized_short_label'
      )
    )
  })

  it('moves slider on pointer drag', async () => {
    const item = createResultItem()
    wrapper = await mountSuspended(ImagePreviewModal, {
      props: { item },
      attachTo: document.body,
    })

    const container = document.querySelector(
      '.comparison-container'
    ) as HTMLElement
    const handle = document.querySelector('.slider-handle') as HTMLElement

    vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 1000,
      height: 600,
      right: 1000,
      bottom: 600,
      x: 0,
      y: 0,
      toJSON: () => {},
    })

    handle.dispatchEvent(
      new PointerEvent('pointerdown', { clientX: 500, cancelable: true })
    )
    document.dispatchEvent(
      new PointerEvent('pointermove', { clientX: 700 })
    )
    document.dispatchEvent(new PointerEvent('pointerup'))
    await waitForPromises()

    expect(handle.style.left).toBe('70%')
  })

  it('moves slider with arrow keys', async () => {
    const item = createResultItem()
    wrapper = await mountSuspended(ImagePreviewModal, {
      props: { item },
      attachTo: document.body,
    })

    const handle = document.querySelector('.slider-handle') as HTMLElement

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight' })
    )
    await waitForPromises()

    expect(handle.style.left).toBe('2%')

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowLeft' })
    )
    await waitForPromises()

    expect(handle.style.left).toBe('2%')
  })

  it('shows zoom button when image can be zoomed', async () => {
    const item = createResultItem()
    wrapper = await mountSuspended(ImagePreviewModal, {
      props: { item },
      attachTo: document.body,
    })

    const optimizedImg =
      document.querySelector<HTMLImageElement>('.image-layer-optimized')

    Object.defineProperty(optimizedImg!, 'naturalWidth', {
      value: 1920,
      configurable: true,
    })
    Object.defineProperty(optimizedImg!, 'offsetWidth', {
      value: 800,
      configurable: true,
    })

    optimizedImg?.dispatchEvent(new Event('load'))
    await waitForPromises()

    const zoomButton = document.querySelector('.zoom-button')
    expect(zoomButton).not.toBeNull()
    expect(zoomButton?.textContent?.trim()).toBe(
      useNuxtApp().$i18n.t('components.image_preview_modal.zoom_in_label')
    )
  })

  it('hides zoom button when image cannot be zoomed', async () => {
    const item = createResultItem()
    wrapper = await mountSuspended(ImagePreviewModal, {
      props: { item },
      attachTo: document.body,
    })

    const optimizedImg =
      document.querySelector<HTMLImageElement>('.image-layer-optimized')

    Object.defineProperty(optimizedImg!, 'naturalWidth', {
      value: 100,
      configurable: true,
    })
    Object.defineProperty(optimizedImg!, 'offsetWidth', {
      value: 800,
      configurable: true,
    })

    optimizedImg?.dispatchEvent(new Event('load'))
    await waitForPromises()

    const zoomButton = document.querySelector('.zoom-button')
    expect(zoomButton).toBeNull()
  })

  it('toggles zoom on zoom button click', async () => {
    const item = createResultItem()
    wrapper = await mountSuspended(ImagePreviewModal, {
      props: { item },
      attachTo: document.body,
    })

    const optimizedImg =
      document.querySelector<HTMLImageElement>('.image-layer-optimized')

    Object.defineProperty(optimizedImg!, 'naturalWidth', {
      value: 1920,
      configurable: true,
    })
    Object.defineProperty(optimizedImg!, 'offsetWidth', {
      value: 800,
      configurable: true,
    })

    optimizedImg?.dispatchEvent(new Event('load'))
    await waitForPromises()

    const container = document.querySelector('.comparison-container')!
    expect(container.classList.contains('zoomed')).toBe(false)

    const zoomButton = document.querySelector('.zoom-button') as HTMLButtonElement
    zoomButton.click()
    await waitForPromises()

    expect(container.classList.contains('zoomed')).toBe(true)

    zoomButton.click()
    await waitForPromises()

    expect(container.classList.contains('zoomed')).toBe(false)
  })

  it('removes document event listeners on unmount', async () => {
    const item = createResultItem()
    wrapper = await mountSuspended(ImagePreviewModal, {
      props: { item },
      attachTo: document.body,
    })

    const removeSpy = vi.spyOn(document, 'removeEventListener')
    wrapper.unmount()

    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    expect(removeSpy).toHaveBeenCalledWith('pointermove', expect.any(Function))
    expect(removeSpy).toHaveBeenCalledWith('pointerup', expect.any(Function))

    removeSpy.mockRestore()
  })

  it('formats large sizes in MB', async () => {
    const item = createResultItem({
      originalSize: 2_000_000,
      optimizedSize: 500_000,
    })
    wrapper = await mountSuspended(ImagePreviewModal, {
      props: { item },
      attachTo: document.body,
    })

    const sizes = document.querySelectorAll('.info-size')
    expect(sizes[0]?.textContent?.trim()).toBe('1.91 MB')
    expect(sizes[1]?.textContent?.trim()).toBe('0.48 MB')
  })

  it('applies clip-path to original image layer based on slider position', async () => {
    const item = createResultItem()
    wrapper = await mountSuspended(ImagePreviewModal, {
      props: { item },
      attachTo: document.body,
    })

    const container = document.querySelector(
      '.comparison-container'
    ) as HTMLElement
    const handle = document.querySelector('.slider-handle') as HTMLElement

    vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 1000,
      height: 600,
      right: 1000,
      bottom: 600,
      x: 0,
      y: 0,
      toJSON: () => {},
    })

    const originalLayer = document.querySelector(
      '.image-layer-original'
    ) as HTMLElement

    const initialClipPath = originalLayer.style.clipPath
    expect(initialClipPath).toContain('inset(0')

    handle.dispatchEvent(
      new PointerEvent('pointerdown', { clientX: 250, cancelable: true })
    )
    await waitForPromises()

    const updatedClipPath = originalLayer.style.clipPath
    expect(updatedClipPath).toContain('inset(0 75% 0 0)')
  })
})

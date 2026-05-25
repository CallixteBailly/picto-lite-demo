<template>
  <Teleport to="body">
    <div class="modal-backdrop" @click="emit('close')">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <span class="modal-title">{{ item.name }}</span>
          <button class="close-button" @click="emit('close')">
            {{ t('components.image_preview_modal.close_label') }}
          </button>
        </div>
        <div class="info-bar">
          <div class="info-side info-original">
            <span class="info-label">
              {{ t('components.image_preview_modal.original_label') }}
            </span>
            <span v-if="originalDimensions" class="info-dims">
              {{ formatDimensions(originalDimensions) }}
            </span>
            <span class="info-size">
              {{ formatSize(item.originalSize) }}
            </span>
          </div>
          <div class="info-separator" />
          <div class="info-side info-optimized">
            <span class="info-label">
              {{ t('components.image_preview_modal.optimized_label') }}
            </span>
            <span v-if="optimizedDimensions" class="info-dims">
              {{ formatDimensions(optimizedDimensions) }}
            </span>
            <span class="info-size">
              {{ formatSize(item.optimizedSize) }}
            </span>
          </div>
        </div>
        <div class="modal-body">
          <div
            ref="comparisonContainerRef"
            class="comparison-container"
            :class="{ zoomed: isZoomed }">
            <img
              ref="optimizedImgRef"
              class="image-layer-optimized"
              :src="optimizedUrl"
              :alt="t('components.image_preview_modal.optimized_label')"
              draggable="false"
              @load="onImageLoad" />
            <div
              class="image-layer-original"
              :style="{ clipPath: originalClipPath }">
              <img
                ref="originalImgRef"
                :src="originalUrl"
                :alt="t('components.image_preview_modal.original_label')"
                draggable="false"
                @load="onImageLoad" />
            </div>
            <div
              class="slider-handle"
              :style="{ left: sliderLeft }"
              role="slider"
              tabindex="0"
              :aria-label="t('components.image_preview_modal.slider_hint')"
              :aria-valuenow="ariaValueNow"
              aria-valuemin="0"
              aria-valuemax="100"
              @pointerdown="onPointerDown" />
            <div
              class="floating-label label-before"
              :style="{ left: `calc(${sliderLeft} * 0.5)` }">
              {{ t('components.image_preview_modal.original_short_label') }}
            </div>
            <div
              class="floating-label label-after"
              :style="{
                left: `calc(${sliderLeft} + (100% - ${sliderLeft}) * 0.5)`,
              }">
              {{ t('components.image_preview_modal.optimized_short_label') }}
            </div>
          </div>
        </div>
        <div class="button-bar">
          <button v-if="canZoom" class="zoom-button" @click="toggleZoom">            {{
              isZoomed
                ? t('components.image_preview_modal.zoom_out_label')
                : t('components.image_preview_modal.zoom_in_label')
            }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { ResultItem } from '~/types/result'

const props = defineProps<{
  item: ResultItem
}>()

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()

const sliderPosition = ref(0)
const isDragging = ref(false)
const isZoomed = ref(false)
const canZoom = ref(true)
const entranceDone = ref(false)

const originalDimensions = ref<{ width: number; height: number } | null>(null)
const optimizedDimensions = ref<{ width: number; height: number } | null>(null)

const originalUrl = ref('')
const optimizedUrl = ref('')

const comparisonContainerRef = ref<HTMLElement>()
const originalImgRef = ref<HTMLImageElement>()
const optimizedImgRef = ref<HTMLImageElement>()

const pendingClick = ref<{ relX: number; relY: number } | null>(null)

const originalClipPath = computed(
  () => `inset(0 ${(1 - sliderPosition.value) * 100}% 0 0)`
)

const sliderLeft = computed(() => `${sliderPosition.value * 100}%`)

const ariaValueNow = computed(() => Math.round(sliderPosition.value * 100))

function formatSize(bytes: number): string {
  return bytes > 1024 * 1024
    ? (bytes / (1024 * 1024)).toFixed(2) + ' MB'
    : (bytes / 1024).toFixed(1) + ' KB'
}

function formatDimensions(dims: { width: number; height: number }): string {
  return `${dims.width} × ${dims.height}`
}

function onImageLoad(): void {
  const origImg = originalImgRef.value
  const optImg = optimizedImgRef.value

  if (origImg && origImg.naturalWidth > 0) {
    originalDimensions.value = {
      width: origImg.naturalWidth,
      height: origImg.naturalHeight,
    }
  }

  if (optImg && optImg.naturalWidth > 0) {
    optimizedDimensions.value = {
      width: optImg.naturalWidth,
      height: optImg.naturalHeight,
    }
  }

  if (
    optImg &&
    optImg.naturalWidth > 0 &&
    optImg.offsetWidth < optImg.naturalWidth
  ) {
    canZoom.value = true
  } else {
    canZoom.value = false
  }
}

function updateSliderPosition(clientX: number): void {
  const container = comparisonContainerRef.value
  if (!container) return

  const rect = container.getBoundingClientRect()
  const x = clientX - rect.left
  sliderPosition.value = Math.max(0.02, Math.min(0.98, x / rect.width))
}

function onPointerDown(event: PointerEvent): void {
  isDragging.value = true
  event.preventDefault()
  updateSliderPosition(event.clientX)
}

function onPointerMove(event: PointerEvent): void {
  if (!isDragging.value) return
  updateSliderPosition(event.clientX)
}

function onPointerUp(): void {
  isDragging.value = false
}

function onKeyDown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    emit('close')
    return
  }

  if (event.key === 'ArrowLeft') {
    sliderPosition.value = Math.max(0.02, sliderPosition.value - 0.02)
    event.preventDefault()
  } else if (event.key === 'ArrowRight') {
    sliderPosition.value = Math.min(0.98, sliderPosition.value + 0.02)
    event.preventDefault()
  }
}

function onSliderKeyDown(event: KeyboardEvent): void {
  if (event.key === 'ArrowLeft') {
    sliderPosition.value = Math.max(0.02, sliderPosition.value - 0.02)
    event.preventDefault()
  } else if (event.key === 'ArrowRight') {
    sliderPosition.value = Math.min(0.98, sliderPosition.value + 0.02)
    event.preventDefault()
  }
}

function toggleZoom(): void {
  if (!isZoomed.value) {
    const optImg = optimizedImgRef.value
    if (optImg && optImg.naturalWidth > 0 && optImg.offsetWidth >= optImg.naturalWidth) {
      return
    }
  }

  isZoomed.value = !isZoomed.value
}

function scrollAfterZoomIn(): void {
  const container = comparisonContainerRef.value
  if (!container) return

  if (pendingClick.value) {
    const img = container.querySelector('.image-layer-optimized') as HTMLElement
    if (img) {
      container.scrollLeft = Math.max(
        0,
        pendingClick.value.relX * img.offsetWidth - container.clientWidth / 2
      )
      container.scrollTop = Math.max(
        0,
        pendingClick.value.relY * img.offsetHeight - container.clientHeight / 2
      )
    }
    pendingClick.value = null
  } else {
    const img = container.querySelector('.image-layer-optimized') as HTMLElement
    if (img) {
      container.scrollLeft = Math.max(
        0,
        (img.offsetWidth - container.clientWidth) / 2
      )
      container.scrollTop = Math.max(
        0,
        (img.offsetHeight - container.clientHeight) / 2
      )
    }
  }
}

watch(isZoomed, val => {
  if (val) {
    nextTick(() => scrollAfterZoomIn())
  }
}, { flush: 'post' })

onMounted(() => {
  originalUrl.value = URL.createObjectURL(props.item.originalBlob)
  optimizedUrl.value = URL.createObjectURL(props.item.blob)
  document.addEventListener('keydown', onKeyDown)
  document.addEventListener('pointermove', onPointerMove)
  document.addEventListener('pointerup', onPointerUp)
  document.body.style.overflow = 'hidden'
})

onBeforeUnmount(() => {
  URL.revokeObjectURL(originalUrl.value)
  URL.revokeObjectURL(optimizedUrl.value)
  document.removeEventListener('keydown', onKeyDown)
  document.removeEventListener('pointermove', onPointerMove)
  document.removeEventListener('pointerup', onPointerUp)
  document.body.style.overflow = ''
})
</script>

<style lang="scss" scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: $modal-z-index;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);

  .modal-content {
    width: 90vw;
    max-width: 1200px;
    height: 90vh;
    display: flex;
    flex-direction: column;
    background: $white-color;
    border-radius: 8px;
    overflow: hidden;

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid $light-grey-color;
      flex-shrink: 0;

      .modal-title {
        font-weight: 600;
        font-size: 16px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .close-button {
        padding: 4px 12px;
        background-color: $dark-grey-color;
        color: $white-color;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        flex-shrink: 0;

        &:hover {
          background-color: $grey-color-2;
        }
      }
    }

    .info-bar {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      border-bottom: 1px solid $light-grey-color;
      flex-shrink: 0;
      gap: 12px;
      font-size: 13px;

      .info-side {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
        min-width: 0;

        &.info-original {
          justify-content: flex-start;
        }

        &.info-optimized {
          justify-content: flex-end;
        }
      }

      .info-label {
        font-weight: 500;
        flex-shrink: 0;
      }

      .info-dims {
        color: $grey-blue-color;
        flex-shrink: 0;
      }

      .info-size {
        color: $grey-blue-color;
        flex-shrink: 0;
      }

      .info-separator {
        width: 1px;
        height: 16px;
        background: $light-grey-color;
        flex-shrink: 0;
      }
    }

    .modal-body {
      min-height: 0;
      flex: 1;
      padding: 16px;
      overflow: hidden;
      display: flex;

      .comparison-container {
        position: relative;
        flex: 1;
        overflow: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid $light-grey-color;
        border-radius: 4px;
        overscroll-behavior: contain;
        user-select: none;

        .image-layer-optimized {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          flex-shrink: 0;
          pointer-events: none;
        }

        .image-layer-original {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;

          img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            pointer-events: none;
          }
        }

        .slider-handle {
          position: absolute;
          top: 0;
          width: 4px;
          height: 100%;
          background: $white-color;
          cursor: col-resize;
          z-index: 10;
          transform: translateX(-2px);
          box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);

          &::before {
            content: '◀ ▶';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: $white-color;
            border-radius: 50%;
            font-size: 10px;
            letter-spacing: -2px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            transition: transform 0.15s ease;
            white-space: nowrap;
            color: $dark-grey-color;
          }

          &:hover::before {
            transform: translate(-50%, -50%) scale(1.1);
          }

          &:active {
            cursor: grabbing;
          }

          &:focus-visible {
            outline: 2px solid $blue-color;
            outline-offset: 2px;
          }
        }

        .floating-label {
          position: absolute;
          top: 12px;
          transform: translateX(-50%);
          font-size: 13px;
          color: $white-color;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 4px;
          padding: 2px 8px;
          z-index: 5;
          pointer-events: none;
          white-space: nowrap;

          @media (max-width: $md) {
            font-size: 11px;
          }
        }

        &.zoomed {
          align-items: flex-start;
          justify-content: flex-start;

          .image-layer-optimized {
            max-width: none;
            max-height: none;
          }

          .image-layer-original {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
          }
        }
      }
    }

    .button-bar {
      display: flex;
      justify-content: center;
      padding: 8px 16px;
      border-top: 1px solid $light-grey-color;
      flex-shrink: 0;

      .zoom-button {
        padding: 4px 12px;
        background-color: $blue-color;
        color: $white-color;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        flex-shrink: 0;

        &:hover {
          background-color: $blue-color-2;
        }
      }
    }
  }
}
</style>

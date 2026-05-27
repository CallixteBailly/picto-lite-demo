<template>
  <div class="uploader-container">
    <input
      id="upload-input"
      ref="input"
      type="file"
      multiple
      accept="image/*"
      hidden
      @change="onInputChange" />

    <div
      class="drop-zone"
      :class="{ 'drag-hover': isDragOver }"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
      @click="input?.click()">
      <div>{{ t('components.image_uploader.drop_zone_description') }}</div>
      <div class="supported-formats">
        {{ t('components.image_uploader.drop_zone_supported_formats') }}
      </div>
    </div>

    <div class="webp-option-container">
      <input id="webp-convert" v-model="convertToWebp" type="checkbox" />
      <label for="webp-convert" class="name">
        {{ t('components.image_uploader.webp_option_checkbox_name') }}
      </label>
    </div>

    <div v-if="totalFiles > 0" class="progress-container">
      <div
        class="progress-bar-container"
        :class="{ 'is-processing': isProcessing }">
        <div class="progress-bar" :style="progressStyle" />
      </div>
      <div class="progress-text">{{ processedFiles }} / {{ totalFiles }}</div>
    </div>

    <div v-if="results.length > 0 && !isProcessing" class="bulk-actions">
      <button
        v-if="successfulResults.length > 0"
        class="download-all-button"
        @click="downloadAllImages">
        {{ t('components.image_uploader.download_all_wording') }}
      </button>
      <button class="clear-all-button" @click="clearAll">
        {{ t('components.image_uploader.clear_all_wording') }}
      </button>
    </div>

    <div class="results-list">
      <div
        v-for="(item, idx) in results"
        :key="item.id"
        class="results-list-item">
        <div class="item-details">
          <div class="item-name">{{ item.name }}</div>
          <div :class="['item-size', reductionClass(item)]">
            {{ formatImageReductionWording(item) }}
          </div>
          <ReductionGauge
            v-if="item.success"
            :original-size="item.originalSize"
            :optimized-size="item.optimizedSize"
            :delay="idx * 80"
          />
          <div v-if="!item.success" class="unsupported-format">
            {{ t('components.image_uploader.unsupported_format') }}
          </div>
        </div>
        <div class="item-actions">
          <button
            v-if="item.success"
            class="preview-button"
            @click="previewItem = item">
            {{ t('components.image_uploader.preview_image_wording') }}
          </button>
          <button class="download-button" @click="downloadImage(item)">
            {{ t('components.image_uploader.download_image_wording') }}
          </button>
          <button class="delete-button" @click="removeItem(idx)">
            {{ t('components.image_uploader.delete_item_wording') }}
          </button>
        </div>
      </div>
    </div>

    <ImagePreviewModal
      v-if="previewItem"
      :item="previewItem"
      @close="previewItem = null" />
  </div>
</template>

<script setup lang="ts">
import JSZip from 'jszip'
import type { ResultItem } from '~/types/result'
import type { ShowSaveFilePicker } from '~/types/file-picker'

const { t } = useI18n()

const imageReductionWording = computed(() =>
  t('components.image_uploader.image_reduction_wording')
)

const input = ref<HTMLInputElement>()
const results = ref<ResultItem[]>([])
const previewItem = ref<ResultItem | null>(null)
const convertToWebp = ref(false)
const isDragOver = ref(false)
const totalFiles = ref(0)
const processedFiles = ref(0)
const currentBatchId = ref(0)
const itemIdCounter = ref(0)

const isProcessing = computed(
  () => totalFiles.value > 0 && processedFiles.value < totalFiles.value
)
const successfulResults = computed(() => results.value.filter(r => r.success))

const progressPercent = computed(() =>
  Math.round((processedFiles.value / Math.max(1, totalFiles.value)) * 100)
)
const progressStyle = computed(() => {
  const minimalFileRequired: number = 1
  return {
    width: `${progressPercent.value}%`,
    transition:
      totalFiles.value <= minimalFileRequired ? 'none' : 'width 0.1s ease',
  }
})

const onDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = true
}

const onDragLeave = () => {
  isDragOver.value = false
}

function onInputChange(event: Event): void {
  const target = event.target as HTMLInputElement | null
  const files = target?.files

  if (!files || files.length === 0) {
    return
  }

  void handleFiles(files)
}

function onDrop(event: DragEvent): void {
  const dataTransfer = event.dataTransfer
  const files = dataTransfer?.files

  if (!files || files.length === 0) {
    isDragOver.value = false
    return
  }

  void handleFiles(files)
  isDragOver.value = false
}

async function handleFiles(files: FileList) {
  previewItem.value = null
  processedFiles.value = 0
  totalFiles.value = 0
  results.value = []

  const batchId = ++currentBatchId.value
  totalFiles.value = files.length

  for (const file of Array.from(files)) {
    const fileResult = await optimizeImage(file, convertToWebp.value)

    if (currentBatchId.value !== batchId) {
      return
    }

    const shouldUseWebpExt = fileResult.success && convertToWebp.value
    const ext = shouldUseWebpExt ? 'webp' : file.name.split('.').pop()!
    const name = `${file.name.replace(/\.[^/.]+$/, '')}.${ext}`

    results.value.push({
      id: String(++itemIdCounter.value),
      name,
      blob: fileResult.file,
      originalBlob: file,
      originalSize: file.size,
      optimizedSize: fileResult.file.size,
      success: fileResult.success,
    })

    processedFiles.value++
  }
}

function removeItem(idx: number): void {
  if (previewItem.value === results.value[idx]) {
    previewItem.value = null
  }

  results.value.splice(idx, 1)

  if (results.value.length === 0) {
    totalFiles.value = 0
    processedFiles.value = 0
  }
}

function clearAll(): void {
  currentBatchId.value++
  results.value = []
  totalFiles.value = 0
  processedFiles.value = 0
  previewItem.value = null
}

function formatImageReductionWording(item: ResultItem): string {
  const originalSize = formatSize(item.originalSize)
  const optimizedSize = formatSize(item.optimizedSize)
  const reduction = reductionPercent(item)

  return `${originalSize} → ${optimizedSize} (${reduction}% ${imageReductionWording.value})`
}

function formatSize(bytes: number): string {
  return bytes > 1024 * 1024
    ? (bytes / (1024 * 1024)).toFixed(2) + ' MB'
    : (bytes / 1024).toFixed(1) + ' KB'
}

function reductionPercent(item: ResultItem): number {
  return Math.round((1 - item.optimizedSize / item.originalSize) * 100)
}

function reductionClass(item: ResultItem): string {
  const percent = reductionPercent(item)

  if (percent >= 20) {
    return 'reduction-good'
  }

  if (percent > 0) {
    return 'reduction-moderate'
  }

  return 'reduction-none'
}

function downloadImageFallback(item: ResultItem): void {
  const url = URL.createObjectURL(item.blob)
  const a = document.createElement('a')

  a.href = url
  a.download = item.name
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

async function downloadAllImages(): Promise<void> {
  const zip = new JSZip()

  for (const item of successfulResults.value) {
    const arrayBuffer = await item.blob.arrayBuffer()
    zip.file(item.name, arrayBuffer)
  }

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 1 },
  })
  const url = URL.createObjectURL(zipBlob)
  const a = document.createElement('a')

  a.href = url
  a.download = 'optimized-images.zip'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

async function downloadImage(item: ResultItem) {
  try {
    // File System Access API
    if (hasShowSaveFilePicker(window)) {
      const handle = await window.showSaveFilePicker({
        suggestedName: item.name,
        types: [
          {
            description: 'Image file',
            accept: {
              'image/*': ['.webp', '.png', '.jpg', '.jpeg'],
            },
          },
        ],
      })

      const writable = await handle.createWritable()
      await writable.write(item.blob)
      await writable.close()
      return
    }
  } catch {
    // Fall through to fallback
  }

  downloadImageFallback(item)
}

function hasShowSaveFilePicker(w: Window): w is Window & ShowSaveFilePicker {
  return typeof w.showSaveFilePicker === 'function'
}
</script>

<style scoped>
.uploader-container {
  max-width: 800px;
  margin: 0 auto;
}

.drop-zone {
  border: 2px dashed var(--border-color, #cbd5e1);
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--surface-bg, #f8fafc);
  color: var(--text-primary, #1e293b);
  font-size: 1.1rem;
}

.drop-zone:hover {
  border-color: var(--primary-color, #6366f1);
  background: var(--surface-hover, #eef2ff);
}

.drop-zone.drag-hover {
  border-color: var(--primary-color, #6366f1);
  background: var(--surface-hover, #eef2ff);
  transform: scale(1.01);
}

.supported-formats {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-secondary, #64748b);
}

.webp-option-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 1rem;
  color: var(--text-primary, #1e293b);
}

.webp-option-container label {
  cursor: pointer;
  font-size: 0.95rem;
}

.progress-container {
  margin-top: 1.5rem;
}

.progress-bar-container {
  width: 100%;
  height: 8px;
  background: var(--border-color, #e2e8f0);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-container.is-processing {
  animation: pulse-bar 1.5s ease infinite;
}

@keyframes pulse-bar {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.progress-bar {
  height: 100%;
  background: var(--primary-color, #6366f1);
  border-radius: 4px;
  transition: width 0.1s ease;
}

.progress-text {
  text-align: center;
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-secondary, #64748b);
}

.bulk-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.download-all-button {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 8px;
  background: var(--primary-color, #6366f1);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.download-all-button:hover {
  background: var(--primary-hover, #4f46e5);
}

.clear-all-button {
  padding: 0.6rem 1.2rem;
  border: 1px solid var(--border-color, #cbd5e1);
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary, #64748b);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-all-button:hover {
  border-color: #ef4444;
  color: #ef4444;
}

.results-list {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.results-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 10px;
  background: var(--surface-bg, #f8fafc);
  flex-wrap: wrap;
  gap: 0.5rem;
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 200px;
}

.item-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-primary, #1e293b);
  word-break: break-all;
}

.item-size {
  font-size: 0.85rem;
  color: var(--text-secondary, #64748b);
}

.item-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.preview-button,
.download-button,
.delete-button {
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preview-button {
  background: var(--surface-hover, #eef2ff);
  color: var(--primary-color, #6366f1);
}

.preview-button:hover {
  background: var(--primary-color, #6366f1);
  color: white;
}

.download-button {
  background: var(--primary-color, #6366f1);
  color: white;
}

.download-button:hover {
  background: var(--primary-hover, #4f46e5);
}

.delete-button {
  background: transparent;
  border: 1px solid var(--border-color, #e2e8f0);
  color: var(--text-secondary, #64748b);
}

.delete-button:hover {
  border-color: #ef4444;
  color: #ef4444;
}

.reduction-good {
  color: #059669;
}

.reduction-moderate {
  color: #d97706;
}

.reduction-none {
  color: #9ca3af;
}

.unsupported-format {
  font-size: 0.8rem;
  color: #ef4444;
  font-weight: 500;
}
</style>

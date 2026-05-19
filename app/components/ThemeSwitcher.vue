<template>
  <button
    class="theme-switcher"
    :aria-label="toggleLabel"
    :title="toggleLabel"
    @click="toggleTheme">
    <Icon
      :name="isDark ? 'pl-icon:sun' : 'pl-icon:moon'"
      :color="iconColor"
      size="22px"
      mode="svg"
      aria-hidden="true" />
  </button>
</template>

<script setup lang="ts">
const colorMode = useColorMode()
const { t } = useI18n()

const toggleLabel = computed(() => t('components.theme_switcher.toggle_label'))

const isDark = computed(() => colorMode.value === 'dark')

const iconColor = computed(() => 'var(--text-color)')

const toggleTheme = (): void => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<style lang="scss" scoped>
.theme-switcher {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid var(--card-border);
  border-radius: 8px;
  background: var(--header-bg);
  cursor: pointer;
  color: var(--text-color);
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    border-color: var(--blue-color);
  }
}
</style>

<template>
  <div class="header-container">
    <div class="title">{{ t('app.name') }}</div>
    <ThemeSwitcher />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>

<style lang="scss" scoped>
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background-color: var(--header-bg);
  border-radius: 15px;
  box-shadow: 0 2px 8px var(--shadow-color);

  .title {
    text-align: center;
    font-size: 25px;
    font-weight: bold;
    color: var(--text-color);
  }
}
</style>

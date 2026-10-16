<script setup lang="ts">
defineProps<{ targetId: string }>()
</script>

<template>
  <div :id="targetId" class="layout-portal-target" />
</template>

<style scoped>
.layout-portal-target {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}
</style>

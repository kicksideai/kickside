<script setup lang="ts">
import { useEvents, useProps } from '@wippy-fe/webcomponent-vue'
import Launcher from './ManualTaskLauncher.vue'
const props = useProps<{ target?: string; parent?: string; title?: string }>()
const emit = useEvents<{ created: { id: string }; error: { message: string; error: unknown } }>()
</script>
<template>
  <Launcher :target="props.target || ''" :parent="props.parent || ''" :title="props.title || 'Manual task'" @queued="emit('created', $event)" @error="emit('error', $event)" />
</template>

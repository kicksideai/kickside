<script setup lang="ts">
import { useEvents, useProps } from '@wippy-fe/webcomponent-vue'
import Editor from './ExecutionIdentityEditor.vue'
const props = useProps<{ root?: string }>()
const emit = useEvents<{ change: undefined; error: { message: string; error: unknown } }>()
</script>
<template>
  <Editor :root="props.root || ''" @changed="emit('change', undefined)" @error="emit('error', $event)" />
</template>

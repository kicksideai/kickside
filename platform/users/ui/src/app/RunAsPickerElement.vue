<script setup lang="ts">
import { computed } from 'vue'
import { useEvents, useProps } from '@wippy-fe/webcomponent-vue'
import RunAsPicker from './RunAsPicker.vue'
interface Props { value?: string; root?: string; disabled?: boolean }
interface Selection { principal: { kind: 'user'; id: string }; label: string }
const props = useProps<Props>()
const emit = useEvents<{ 'config-changed': Selection; load: undefined; error: { message: string; error: unknown } }>()
const pickerProps = computed(() => ({ value: props.value?.value, componentId: props.value?.root, disabled: props.value?.disabled }))
</script>
<template>
  <RunAsPicker v-bind="pickerProps" @change="emit('config-changed', $event)"
    @load="emit('load', undefined)" @error="emit('error', $event)" />
</template>

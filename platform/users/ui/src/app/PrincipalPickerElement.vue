<script setup lang="ts">
import { computed } from 'vue'
import { useEvents, useProps } from '@wippy-fe/webcomponent-vue'
import PrincipalPicker from './PrincipalPicker.vue'
interface P { value?: string; config?: string; schema?: string; placeholder?: string; kinds?: string }
interface Selection { id: string; principal_id: string; type: 'user' | 'group'; label: string; [key: string]: unknown }
const props = useProps<P>(), emit = useEvents<{ 'config-changed': Selection; load: undefined; error: { message: string; error: unknown } }>()
const pickerProps = computed<P>(() => props.value ?? {})
// WcMount listens to both historical picker events. Emit only the canonical config event
// so one user choice produces one host write.
function changed(value: Selection) { emit('config-changed', value) }
</script>
<template><PrincipalPicker v-bind="pickerProps" @change="changed" @load="emit('load', undefined)" @error="emit('error', $event)" /></template>

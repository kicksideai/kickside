<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Button from 'primevue/button'

const props = defineProps<{
  visible: boolean
  busy?: boolean
  label: string
  headerClass?: string
  contentClass?: string
  footerClass?: string
}>()
const emit = defineEmits<{ (e: 'close'): void }>()
const dialog = ref<HTMLDialogElement | null>(null)
async function syncVisibility() {
  await nextTick()
  const el = dialog.value
  if (!el) return
  if (props.visible && !el.open) el.showModal()
  else if (!props.visible && el.open) el.close()
}
function cancel(event: Event) {
  event.preventDefault()
  if (!props.busy) emit('close')
}
watch(() => props.visible, syncVisibility)
onMounted(syncVisibility)
onBeforeUnmount(() => { if (dialog.value?.open) dialog.value.close() })
</script>

<template>
  <dialog ref="dialog" class="kx-native-dialog" :aria-label="label" aria-modal="true" :aria-busy="busy || undefined"
    @cancel="cancel" @close="() => { if (visible && !busy) emit('close') }">
    <header :class="headerClass">
      <slot name="header" />
      <Button type="button" text severity="secondary" aria-label="Close dialog"
        :disabled="busy" @click="emit('close')">×</Button>
    </header>
    <div :class="contentClass"><slot /></div>
    <footer v-if="$slots.footer" :class="footerClass"><slot name="footer" /></footer>
  </dialog>
</template>

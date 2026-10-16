<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'

const props = withDefaults(defineProps<{
  icon: string
  label: string
  active?: boolean
  disabled?: boolean
  variant?: 'plain' | 'bordered' | 'danger'
  severity?: 'success' | 'danger' | 'warn' | 'info'
  size?: 'sm' | 'md' | 'lg'
  spin?: boolean
}>(), { variant: 'plain', size: 'md' })
const emit = defineEmits<{ (e: 'click'): void }>()
const instance = getCurrentInstance()
const supportsPressedState = computed(() =>
  Object.prototype.hasOwnProperty.call(instance?.vnode.props ?? {}, 'active'),
)

// The prop IS the PrimeVue severity now; only the variants still need mapping.
const resolvedSeverity = computed(() => {
  if (props.severity) return props.severity
  if (props.variant === 'danger') return 'danger'
  if (props.variant === 'bordered') return 'secondary'
  return undefined
})

const buttonSize = computed(() =>
  props.size === 'sm' ? 'small'
  : props.size === 'lg' ? 'large'
  : undefined,
)
</script>

<template>
  <Button
    :severity="resolvedSeverity"
    :text="variant !== 'bordered' && !active"
    :outlined="variant === 'bordered'"
    :size="buttonSize"
    :loading="spin"
    :disabled="disabled || spin"
    :pt="{
      root: {
        'aria-label': label,
        'aria-pressed': supportsPressedState ? String(active) : undefined,
        title: label,
      },
    }"
    @click="emit('click')"
  >
    <template #icon>
      <Icon :icon="icon" aria-hidden="true" />
    </template>
  </Button>
</template>

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
  size?: 'sm' | 'md' | 'lg'
  spin?: boolean
}>(), { variant: 'plain', size: 'md' })
const emit = defineEmits<{ (e: 'click'): void }>()
const instance = getCurrentInstance()
const supportsPressedState = computed(() =>
  Object.prototype.hasOwnProperty.call(instance?.vnode.props ?? {}, 'active'),
)

const severity = computed(() =>
  props.variant === 'danger' ? 'danger'
  : props.variant === 'bordered' ? 'secondary'
  : undefined,
)

const buttonSize = computed(() =>
  props.size === 'sm' ? 'small'
  : props.size === 'lg' ? 'large'
  : undefined,
)
</script>

<template>
  <Button
    type="button"
    :severity="severity"
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

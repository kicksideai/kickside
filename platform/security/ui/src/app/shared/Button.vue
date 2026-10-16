<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import SpinnerIcon from '@primevue/icons/spinner'
import Button from 'primevue/button'

const props = withDefaults(defineProps<{
  icon?: string
  variant?: 'primary' | 'ghost' | 'soft' | 'danger'
  type?: 'button' | 'submit'
  loading?: boolean
  disabled?: boolean
  small?: boolean
}>(), { variant: 'primary', type: 'button' })
const emit = defineEmits<{ (e: 'click'): void }>()

const severity = computed(() =>
  props.variant === 'danger' ? 'danger'
  : props.variant === 'primary' ? undefined
  : 'secondary',
)
</script>

<template>
  <Button
    :type="type"
    :severity="severity"
    :outlined="variant === 'ghost'"
    :loading="loading"
    :disabled="disabled || loading"
    :size="small ? 'small' : undefined"
    @click="emit('click')"
  >
    <SpinnerIcon v-if="loading" class="p-button-loading-icon p-button-icon" spin />
    <Icon v-if="icon && !loading" :icon="icon" aria-hidden="true" />
    <slot />
  </Button>
</template>

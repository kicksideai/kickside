<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'

// Text button — a thin wrapper over PrimeVue <Button> that keeps this module's
// design-system API (variant/loading/small/icon) stable, so the call sites that
// compose from the shared barrel do not change.
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
    <!-- Keep the icon beside the default-slot label. PrimeVue treats an icon
         slot without a label prop as icon-only and would clip labelled buttons. -->
    <Icon v-if="icon && !loading" :icon="icon" aria-hidden="true" />
    <slot />
  </Button>
</template>

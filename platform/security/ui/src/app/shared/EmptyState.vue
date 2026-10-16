<script setup lang="ts">
import { Icon } from '@iconify/vue'
import Button from './Button.vue'

// Zero-state block: icon, title, optional hint, and an optional call-to-action.
defineProps<{ icon: string; title: string; hint?: string; cta?: string; ctaIcon?: string }>()
const emit = defineEmits<{ (e: 'cta'): void }>()
</script>

<template>
  <div class="km-empty">
    <Icon :icon="icon" class="km-empty-ico" aria-hidden="true" />
    <div class="km-empty-title">{{ title }}</div>
    <p v-if="hint" class="km-empty-hint">{{ hint }}</p>
    <Button v-if="cta" :icon="ctaIcon" @click="emit('cta')">{{ cta }}</Button>
  </div>
</template>

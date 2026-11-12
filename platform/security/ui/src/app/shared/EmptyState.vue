<script setup lang="ts">
import { Icon } from '@iconify/vue'
import Button from './Button.vue'

// Zero-state block: icon, title, optional hint, and an optional call-to-action.
defineProps<{ icon: string; title: string; hint?: string; cta?: string; ctaIcon?: string }>()
const emit = defineEmits<{ (e: 'cta'): void }>()
</script>

<template>
  <div class="kx-empty">
    <div class="kx-empty-ico"><Icon :icon="icon" aria-hidden="true" /></div>
    <div class="kx-empty-title">{{ title }}</div>
    <p v-if="hint" class="kx-empty-sub">{{ hint }}</p>
    <Button v-if="cta" :icon="ctaIcon" @click="emit('cta')">{{ cta }}</Button>
  </div>
</template>

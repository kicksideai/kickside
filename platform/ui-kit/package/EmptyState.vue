<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'

defineProps<{ icon: string; title: string; hint?: string; cta?: string; ctaIcon?: string }>()
defineEmits<{ cta: [] }>()
</script>

<template>
  <div class="kx-empty">
    <div class="kx-empty-ico"><Icon :icon="icon" aria-hidden="true" /></div>
    <div class="kx-empty-title">{{ title }}</div>
    <p v-if="hint || $slots.hint" class="kx-empty-sub"><slot name="hint">{{ hint }}</slot></p>
    <Button v-if="cta" :label="cta" @click="$emit('cta')">
      <template v-if="ctaIcon" #icon="{ class: iconClass }"><Icon :icon="ctaIcon" :class="iconClass" aria-hidden="true" /></template>
    </Button>
  </div>
</template>

<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import { useId } from 'vue'

defineProps<{ title?: string; count?: number }>()
const headingId = useId()
</script>

<template>
  <section class="kx-settings-group" :aria-labelledby="title ? headingId : undefined">
    <div v-if="title" class="kx-settings-group-head">
      <h2 :id="headingId" class="kx-settings-group-title">{{ title }}</h2>
      <span v-if="count !== undefined" class="kx-settings-group-count">{{ count }}</span>
    </div>
    <div class="kx-settings-group-list"><slot /></div>
  </section>
</template>

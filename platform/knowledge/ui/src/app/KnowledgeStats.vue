<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { StatItem } from './knowledge.types'

defineProps<{ items: StatItem[] }>()
</script>

<template>
  <span v-if="items.length" class="kx-header-stats" aria-label="Knowledge statistics">
    <template v-for="(item, index) in items" :key="index">
      <span v-if="index" aria-hidden="true"> · </span>
      <span class="kx-header-stat">
        <Icon v-if="item.icon" :icon="item.icon" aria-hidden="true" />
        <span class="kx-header-stat-label">{{ item.value.toLocaleString() }} {{ item.label }}</span>
      </span>
    </template>
  </span>
</template>

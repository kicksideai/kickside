<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { StatItem } from './knowledge.types'
defineProps<{items:StatItem[]}>()
</script>
<template><span v-if="items.length" class="kx-header-stats" aria-label="Knowledge statistics"><template v-for="(item,index) in items" :key="index"><span v-if="index" aria-hidden="true"> · </span><span class="kx-stat"><Icon v-if="item.icon" :icon="item.icon" aria-hidden="true" />{{ item.value.toLocaleString() }} {{ item.label }}</span></template></span></template>
<style scoped>
.kx-header-stats {display:inline-flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:12px;color:var(--p-text-muted-color)}
.kx-stat {display:inline-flex;align-items:center;gap:4px;white-space:nowrap}
</style>

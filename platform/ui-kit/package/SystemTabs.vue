<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import Tab from 'primevue/tab'
import TabList from 'primevue/tablist'
import Tabs from 'primevue/tabs'

defineProps<{
  value: string
  label: string
  items: { value: string; label: string; count?: number; controls?: string }[]
}>()
defineEmits<{ 'update:value': [value: string] }>()
</script>

<template>
  <Tabs class="kx-system-tabs" data-kx-separator="surface" :value="value" @update:value="$emit('update:value', String($event))">
    <TabList :pt="{ tabList: { 'aria-label': label } }">
      <Tab v-for="item in items" :key="item.value" :value="item.value" v-bind="item.controls ? { 'aria-controls': item.controls } : {}">
        {{ item.label }}<b v-if="item.count !== undefined" class="kx-system-tab-count">{{ item.count }}</b>
      </Tab>
    </TabList>
  </Tabs>
</template>

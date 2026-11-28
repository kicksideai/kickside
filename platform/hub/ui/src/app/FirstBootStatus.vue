<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { api } from '@wippy-fe/proxy'
import { keeperHub, type FirstBootInstallStatus, type FirstBootModuleStatus } from '../keeper-hub.ts'

const POLL_MS = 3000
const hub = keeperHub(api)
const state = ref<FirstBootInstallStatus | null>(null)
let timer: ReturnType<typeof setTimeout> | undefined
let stopped = false
let watching = false
let retryDelay = POLL_MS

const ICONS: Record<FirstBootModuleStatus, string> = {
  pending: 'tabler:clock',
  installing: 'tabler:loader-2',
  installed: 'tabler:circle-check',
  failed: 'tabler:alert-circle',
}
const LABELS: Record<FirstBootModuleStatus, string> = {
  pending: 'Waiting',
  installing: 'Installing',
  installed: 'Installed',
  failed: 'Failed',
}

async function load() {
  try {
    const next = await hub.firstBootStatus()
    if (stopped) return
    state.value = next
    if (next.configured && next.status !== 'completed' && next.retryable !== false) {
      watching = true
      retryDelay = next.status === 'failed' ? Math.min(30000, retryDelay * 2) : POLL_MS
      timer = setTimeout(load, retryDelay)
    } else if (watching) {
      watching = false
      window.dispatchEvent(new CustomEvent('kickside:modules-changed'))
    }
  } catch {
    if (stopped) return
    timer = setTimeout(load, retryDelay)
    retryDelay = Math.min(30000, retryDelay * 2)
  }
}

onMounted(load)
onBeforeUnmount(() => {
  stopped = true
  if (timer) clearTimeout(timer)
})
</script>

<template>
  <section v-if="state?.configured && state.status !== 'completed'" class="km-first-boot" aria-live="polite">
    <p class="km-first-boot-title">
      {{ state.status === 'failed' ? 'Some modules chosen at signup could not be installed' : 'Installing the modules chosen at signup' }}
    </p>
    <p v-if="state.message" class="km-first-boot-msg">{{ state.message }}</p>
    <ul class="km-first-boot-list">
      <li v-for="item in state.modules" :key="item.component" class="km-first-boot-item">
        <Icon :icon="ICONS[item.status]" :class="['km-i', item.status === 'installing' && 'spin', `km-first-boot-${item.status}`]" aria-hidden="true" />
        <span class="km-first-boot-name">{{ item.component }}</span>
        <span class="km-first-boot-state">{{ LABELS[item.status] }}</span>
        <span v-if="item.message" class="km-first-boot-msg">{{ item.message }}</span>
      </li>
    </ul>
    <p v-if="state.retryable === false" class="km-first-boot-msg">Correct the module list in the workspace configuration.</p>
    <p v-else-if="state.status === 'failed'" class="km-first-boot-msg">Install the failed modules from the catalog below, or restart the workspace to try again.</p>
  </section>
</template>

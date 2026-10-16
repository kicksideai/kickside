<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useSwapBuffer, type SwapSlot } from '@wippy-fe/layout'
import { useSurfaces, type NavItem } from '../composables/useSurfaces'
import { normalizePath } from '../router/path'
import SurfaceHost from './SurfaceHost.vue'
import { surfaceIdentity } from './surfaceIdentity'
import { isSurfaceBufferActive } from './surfaceBufferActivity'
import { isSurfaceBufferVisible } from './surfaceBufferVisibility'

interface SurfaceEntry {
  key: string
  path: string
  routeName: string
}

const props = withDefaults(defineProps<{ presented?: boolean }>(), {
  presented: true,
})
const route = useRoute()
const { navItems, loaded } = useSurfaces()

function owningItem(path: string): NavItem | undefined {
  let best: NavItem | undefined
  for (const item of navItems.value) {
    const itemPath = normalizePath(item.path || '/')
    if (itemPath === path) return item
    if (itemPath !== '/' && path.startsWith(`${itemPath}/`)) {
      if (!best || itemPath.length > normalizePath(best.path || '/').length) best = item
    }
  }
  return best
}

const entry = computed<SurfaceEntry | null>(() => {
  // The route exists before registry-driven navigation has resolved. Buffering
  // that provisional route would give it a fallback key, then push the same
  // surface again under its component key when nav arrives. Wait for the owner
  // declaration so one owning surface creates exactly one retained instance.
  if (!loaded.value) return null
  const path = normalizePath(route.path)
  const routeName = String(route.name || '')
  return { key: surfaceIdentity(path, routeName, owningItem(path)), path, routeName }
})

const swap = useSwapBuffer<SurfaceEntry>({
  keyOf: value => value.key,
  buffers: 2,
  readyTimeoutMs: 8000,
  onReadyTimeout: 'reveal',
  onReadyTimeoutFired: slot => console.warn(`[kickside-surface] revealing ${slot.key} after readiness timeout`),
})

watch(entry, value => {
  if (!value) return
  // `/sessions` is owned by the dedicated list + chat panels. Do not route
  // the ordinary surface buffer there: keeping its previous slots untouched
  // is what preserves the application surface off-screen for a later return.
  if (value.path === '/sessions' || value.path.startsWith('/sessions/')) return
  swap.push(value)
}, { immediate: true })

function interactive(slot: SwapSlot<SurfaceEntry>): boolean {
  return isSurfaceBufferActive(slot, swap.topIndex.value, props.presented) && slot.ready && !slot.error
}

function visible(slot: SwapSlot<SurfaceEntry>): boolean {
  return isSurfaceBufferVisible(slot, swap.slots.value, swap.topIndex.value)
}
</script>

<template>
  <div class="surface-buffers">
    <div
      v-for="slot in swap.slots.value"
      v-show="slot"
      :key="slot?.index"
      class="surface-buffer"
      :class="{ 'surface-buffer--visible': slot && visible(slot), 'surface-buffer--top': slot?.index === swap.topIndex.value }"
      :style="{ zIndex: slot?.lastActiveAt ?? 0 }"
      :inert="slot && !interactive(slot) ? true : undefined"
      :aria-hidden="slot && !interactive(slot) ? 'true' : undefined"
    >
      <SurfaceHost
        v-if="slot"
        :path="slot.entry.path"
        :route-name="slot.entry.routeName"
        :active="isSurfaceBufferActive(slot, swap.topIndex.value, props.presented)"
        @ready="swap.markReady(slot.index, slot.key)"
        @error="swap.markFailed(slot.index, $event, slot.key)"
      />
    </div>

    <div v-if="swap.active.value?.error" class="surface-buffer__error" role="alert">
      <strong>Surface unavailable</strong>
      <span>{{ swap.active.value.error instanceof Error ? swap.active.value.error.message : 'The surface failed to load.' }}</span>
    </div>
    <div v-if="swap.showLoader.value" class="surface-buffer__loader" role="status" aria-live="polite">
      Loading…
    </div>
  </div>
</template>

<style scoped>
.surface-buffers { position: relative; width: 100%; height: 100%; min-width: 0; min-height: 0; overflow: hidden; }
.surface-buffer { position: absolute; inset: 0; min-width: 0; min-height: 0; overflow: auto; visibility: hidden; pointer-events: none; }
.surface-buffer--visible { visibility: visible; }
.surface-buffer--top.surface-buffer--visible { pointer-events: auto; }
.surface-buffer__loader, .surface-buffer__error { position: absolute; z-index: 2147480000; display: grid; place-content: center; gap: .5rem; inset: 0; text-align: center; }
.surface-buffer__loader { pointer-events: none; background: color-mix(in srgb, var(--p-content-background) 25%, transparent); color: var(--p-text-muted-color); }
.surface-buffer__error { padding: 1.5rem; background: var(--p-content-background); color: var(--p-text-muted-color); }
.surface-buffer__error strong { color: var(--p-text-color); }
</style>

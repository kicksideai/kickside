<script setup lang="ts">
import { nextTick, shallowRef, toRef, watch } from 'vue'
import type { Component } from 'vue'
import { useSurfaces, loadRenderer, isComponentTag, type NavItem } from '../composables/useSurfaces'
import { normalizePath } from '../router/path'
import WcSurface from './WcSurface.vue'
import EmptyState from './EmptyState.vue'
import { provideSurfaceActivity } from './surfaceActivity'

// Resolves the active path to its surface, declaratively. The owning nav_item
// decides how it renders: render: component mounts the registry-declared web
// component by tag (a module ships its own UI, no app code); render: surface
// resolves a renderer the bundle ships. Each surface owns its own layout and
// header so full-screen views keep the whole area. When nothing renders the host
// shows a polished empty state instead of a blank screen.
const props = withDefaults(defineProps<{ path: string; routeName?: string; active?: boolean }>(), {
  active: true,
})
const emit = defineEmits<{ ready: []; error: [error: unknown] }>()
provideSurfaceActivity(toRef(props, 'active'))
const { navItems } = useSurfaces()
const surface = shallowRef<Component | null>(null)
const tag = shallowRef<string>('')
const basePath = shallowRef<string>('/')
const missing = shallowRef<string | null>(null)

// The nav item that owns the current path: exact match, else the longest declared
// path that prefixes it (so /system/<tab> resolves to the System item).
function activeItem(path: string): NavItem | undefined {
  let best: NavItem | undefined
  for (const it of navItems.value) {
    const p = normalizePath(it.path || '/')
    if (p === path) return it
    if (p !== '/' && (path === p || path.startsWith(p + '/'))) {
      if (!best || (it.path?.length || 0) > (best.path?.length || 0)) best = it
    }
  }
  return best
}

let resolution = 0
watch(() => [props.path, props.routeName, navItems.value], async () => {
  const currentResolution = ++resolution
  const item = activeItem(props.path)
  if (item && item.render === 'component' && isComponentTag(item.component_tag)) {
    tag.value = item.component_tag
    basePath.value = normalizePath(item.path || '/')
    surface.value = null
    missing.value = null
    return
  }
  tag.value = ''
  // App-owned surface: resolve by the item's surface name, else the route name
  // (covers System tabs reached standalone, which are not nav items).
  const name = item?.surface || item?.route_name || props.routeName || ''
  const loader = name ? loadRenderer(name) : null
  if (!loader) {
    surface.value = null
    missing.value = name || props.path
    await nextTick()
    if (currentResolution === resolution) emit('ready')
    return
  }
  missing.value = null
  try {
    const component = await loader
    if (currentResolution !== resolution) return
    surface.value = component
    await nextTick()
    if (currentResolution === resolution) emit('ready')
  }
  catch (error) {
    if (currentResolution !== resolution) return
    surface.value = null
    missing.value = name || props.path
    emit('error', error)
  }
}, { immediate: true, deep: false })
</script>

<template>
  <WcSurface v-if="tag" :tag="tag" :base-path="basePath" :path="path" :visible="active" @ready="emit('ready')" @error="emit('error', $event)" />
  <component v-else-if="surface" :is="surface" />
  <EmptyState
    v-else
    icon="tabler:components-off"
    title="Surface not available"
    :message="missing
      ? `No component is registered to render the “${missing}” surface yet.`
      : 'This surface has no renderer installed yet.'"
    hint="Install a feature module that ships this view component, then reload."
  />
</template>

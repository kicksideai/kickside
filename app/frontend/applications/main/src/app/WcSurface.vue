<script setup lang="ts">
import { setWippyVisibility } from '@wippy-fe/shared'
import { nextTick, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useWippy } from '../composables/useWippy'
import { isComponentTag } from '../composables/useSurfaces'
import { normalizePath, resolveNavTarget } from '../router/path'
import {
  handleInstrumentRequirementResolution,
  type InstrumentRequirementResolutionRequest,
} from './instrumentRequirementResolution'

// Mounts a registry-declared web component by its tag, filling the area. The
// shell resolves the tag through the host proxy (loadByTagName) — it never
// imports the component, so a surface can be its own standalone WC module.
//
// Deep-link bridge: the part of the route under the surface's base path is fed to
// the element as a `route` attribute, and a `navigate` CustomEvent from the
// element pushes the router (so the URL reflects the in-surface location). A
// surface that ignores both stays a plain full-screen view.
const props = withDefaults(defineProps<{ tag: string; basePath?: string; path: string; visible?: boolean }>(), {
  visible: true,
})
const emit = defineEmits<{ ready: []; error: [error: unknown] }>()
const wippy = useWippy()
const router = useRouter()
const host = ref<HTMLElement | null>(null)
const failed = ref(false)
let el: HTMLElement | null = null
let mountGeneration = 0

// The route relative to the surface base: /knowledge/abc/def with base /knowledge
// becomes "abc/def"; the base itself becomes "".
function subPath(): string {
  const base = normalizePath(props.basePath || '/')
  const full = props.path
  if (base === '/') return full.replace(/^\/+/, '')
  if (full === base) return ''
  if (full.startsWith(base + '/')) return full.slice(base.length + 1)
  return ''
}

function onNavigate(e: Event) {
  const detail = (e as CustomEvent).detail
  const request = detail && typeof detail === 'object'
    ? detail as { path?: string; route?: string; back?: { within: string } }
    : undefined
  const raw = typeof detail === 'string'
    ? detail
    : (request?.path ?? request?.route ?? '')
  // One rule for every surface: an absolute path is a cross-surface route, a
  // relative one is an in-surface deep-link under this surface's base. Empty raw
  // keeps you on the surface base (a plain refresh of the surface).
  const target = raw ? resolveNavTarget(raw, props.basePath) : normalizePath(props.basePath || '/')
  if (typeof request?.back?.within === 'string') {
    const boundary = (resolveNavTarget(request.back.within, props.basePath) || props.basePath || '/').replace(/\/+$/, '') || '/'
    const within = (path: string) => boundary === '/' || path === boundary || path.startsWith(boundary + '/')
    const previous = router.options.history.state.surfacePreviousPath
    if (typeof previous === 'string' && within(router.currentRoute.value.path) && within(router.resolve(previous).path)) {
      router.back()
      return
    }
  }
  if (target && props.path !== target) {
    const { path, query, hash } = router.resolve(target)
    // The existing memory router owns the history. Its per-entry state keeps
    // the previous surface path so Back can remain inside a requested scope.
    router.push({ path, query, hash, state: { surfacePreviousPath: router.currentRoute.value.fullPath } })
  }
}

function onInstrumentRequirementResolution(e: Event) {
  const detail = (e as CustomEvent<InstrumentRequirementResolutionRequest>).detail
  if (!detail) return
  void handleInstrumentRequirementResolution({ api: wippy.api }, detail)
}

// Drop the previous element's navigate listener before it's replaced/destroyed,
// so a tag change or unmount can't leak the handler (and its captured closure).
function detach() {
  if (el) {
    el.removeEventListener('navigate', onNavigate)
    el.removeEventListener('instrumentRequirementResolution', onInstrumentRequirementResolution)
    el = null
  }
}

async function mount() {
  const generation = ++mountGeneration
  const tag = props.tag
  const basePath = props.basePath
  failed.value = false
  detach()
  // `failed` conditionally removes the host. Let Vue restore it before a
  // retry, then clear the old element before the next tag's loader can settle.
  await nextTick()
  if (generation !== mountGeneration || !tag || !host.value) return
  const mountHost = host.value
  mountHost.replaceChildren()
  if (!isComponentTag(tag)) {
    if (generation !== mountGeneration) return
    failed.value = true
    emit('error', new Error(`Invalid surface component tag: ${tag}`))
    return
  }
  try {
    await wippy.loadByTagName(tag)
    // A slot can be evicted or retargeted while a tag is loading. Only the
    // current attempt may mount or report readiness/failure for this buffer.
    if (
      generation !== mountGeneration
      || host.value !== mountHost
      || props.tag !== tag
      || props.basePath !== basePath
    ) return
    const next = document.createElement(tag)
    next.style.display = 'block'
    next.style.width = '100%'
    next.style.minWidth = '0'
    next.style.height = '100%'
    // Web Host owns this lifecycle attribute. It must be present before the
    // element is connected, then change in place as a retained buffer changes
    // ownership; visibility never participates in the mount watcher below.
    setWippyVisibility(next, props.visible)
    next.setAttribute('route', subPath())
    next.addEventListener('load', () => {
      if (generation === mountGeneration && el === next) emit('ready')
    })
    next.addEventListener('error', (event) => {
      if (generation !== mountGeneration || el !== next) return
      const error = new Error(`Component <${tag}> failed to load.`)
      mountHost.replaceChildren()
      el = null
      failed.value = true
      emit('error', error)
      console.error('[kickside-surface] component error', event)
    })
    next.addEventListener('navigate', onNavigate)
    next.addEventListener('instrumentRequirementResolution', onInstrumentRequirementResolution)
    el = next
    mountHost.replaceChildren(next)
  } catch (error) {
    if (generation !== mountGeneration || host.value !== mountHost) return
    mountHost.replaceChildren()
    failed.value = true
    emit('error', error)
  }
}

onMounted(mount)
watch(() => [props.tag, props.basePath], mount)
// Reflect external route changes (deep link, back/forward) into the element.
watch(() => props.path, () => { if (el) el.setAttribute('route', subPath()) })
watch(() => props.visible, visible => { if (el) setWippyVisibility(el, visible) })
onBeforeUnmount(() => {
  // Invalidate unresolved `loadByTagName` calls before removing listeners so a
  // late result cannot recreate a component after this buffer is evicted.
  mountGeneration++
  detach()
})
</script>

<template>
  <div class="wc-surface h-full">
    <div v-if="failed" class="p-6 text-sm text-surface-400">
      Component is not available in this build.
    </div>
    <div v-else ref="host" class="wc-surface-host h-full"></div>
  </div>
</template>

<style scoped>
.wc-surface,
.wc-surface-host {
  width: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}
</style>

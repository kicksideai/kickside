<script setup lang="ts">
import { shallowRef, computed, defineAsyncComponent, onMounted, onUnmounted, watch, type Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import Tab from 'primevue/tab'
import TabList from 'primevue/tablist'
import Tabs from 'primevue/tabs'
import { useApi, useHost } from '../composables/useWippy'
import { hasRenderer, loadRenderer, useSurfaces } from '../composables/useSurfaces'
import { normalizePath } from '../router/path'
import WcSurface from '../app/WcSurface.vue'
import { createRefreshLadder } from '../composables/useRefreshLadder'
import { useSurfaceActivity } from '../app/surfaceActivity'

// System consolidates the operator-facing admin areas under one page with a tab
// strip. The tab set is declarative: /api/v1/settings/tabs returns the
// ui.settings_tab registry entries (ordered), so adding, removing, or reordering
// a tab is a registry change. Each tab declares how it renders — a "surface"
// (resolved through the shared surface registry by name, same as the nav rail) or
// a named render kind. The registry owns which tabs exist; the bundle owns which
// surfaces/render kinds it can draw.
interface TabDef {
  key: string
  label: string
  icon: string
  order: number
  render: string
  surface?: string
  // render: 'component' mounts a registry-declared web component by tag.
  component_tag?: string
  // render: 'link' renders as a header link to this URL (not a tab).
  url?: string
}

const urlPattern = /^(\/[\w/.:~-]*|https?:\/\/[\w/.:~?&=#%-]+)$/

function isUrl(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 200 && urlPattern.test(value)
}

// Non-surface render kinds the bundle ships. Surfaces resolve dynamically via the
// shared surface registry; component tabs mount a WC by tag (no app import).
const renderers: Record<string, Component> = {}
const componentTagPattern = /^[a-z][a-z0-9]*-[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/

function isComponentTag(tag: unknown): tag is string {
  return typeof tag === 'string' && tag.length <= 80 && componentTagPattern.test(tag)
}

function resolveComponent(tab: TabDef): Component | null {
  if (tab.render === 'surface') {
    return tab.surface && hasRenderer(tab.surface)
      ? defineAsyncComponent(() => loadRenderer(tab.surface as string) as Promise<Component>)
      : null
  }
  return renderers[tab.render] ?? null
}

// A contribution is renderable if it mounts a WC tag, maps to a known
// component, or (for a header link) carries a valid URL.
function renderable(tab: TabDef): boolean {
  if (tab.render === 'link') return isUrl(tab.url)
  if (tab.render === 'component') return isComponentTag(tab.component_tag)
  return !!resolveComponent(tab)
}

const api = useApi()
const host = useHost()
const surfaceActive = useSurfaceActivity()
const route = useRoute()
const router = useRouter()
const tabs = shallowRef<TabDef[]>([])
const active = shallowRef('')
const loadError = shallowRef('')
const { schedule: scheduleTabsRefresh, clear: clearTabRefreshTimers } = createRefreshLadder(() => { loadTabs() })
const REGISTRY_CHANGED_EVENT = 'kickside:registry-changed'

// Links render in the header chrome; everything else is a tab in the strip.
const headerLinks = computed(() => tabs.value.filter(t => t.render === 'link'))
const navTabs = computed(() => tabs.value.filter(t => t.render !== 'link'))

function navigateHeaderLink(event: MouseEvent, url: string) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  const link = host.classifyLink(url)
  if (link.kind === 'host-nav') {
    event.preventDefault()
    host.navigate(link.normalizedPath ?? link.href)
  }
}

const activeTab = computed(() => navTabs.value.find(t => t.key === active.value) || null)
const activeTag = computed(() =>
  activeTab.value?.render === 'component' && isComponentTag(activeTab.value.component_tag)
    ? activeTab.value.component_tag
    : '')
const activeComponent = computed(() =>
  activeTab.value && activeTab.value.render !== 'component' ? resolveComponent(activeTab.value) : null)

// The active tab is deep-linkable: it lives in the route (/system/<tab>). Picking
// a tab updates the URL so refresh + shared links land on the same tab.
function selectTab(key: string) {
  if (key === active.value) return
  active.value = key
  router.replace(`/system/${key}`)
}

// Choose the tab named in the route if it exists, else the first.
function applyRouteTab() {
  const want = String(route.params.tab || '')
  active.value = navTabs.value.some(t => t.key === want) ? want : (navTabs.value[0]?.key ?? '')
}

function tabLoadMessage(error: unknown): string {
  const status = (error as { response?: { status?: number } } | null)?.response?.status
  return status === 401 || status === 403
    ? 'System is not available for this account.'
    : 'System sections could not be loaded.'
}

watch(() => route.params.tab, () => { if (tabs.value.length) applyRouteTab() })

// A retained System surface must refresh its registry-defined tabs when it
// regains logical ownership. Do not reload while the outgoing buffer is merely
// still painted as a double-buffer fallback.
watch(surfaceActive, (active, previous) => {
  if (active && previous === false) void loadTabs()
})

let tabsLoad: Promise<void> | null = null
let tabsReloadQueued = false

// System is reachable only through its navigation item, which the shell lists
// when the account holds the System capability.
const { navItems, loaded: navLoaded, loadNav } = useSurfaces()
const systemAvailable = computed(() => navItems.value.some(item => normalizePath(item.path || '/') === '/system'))

async function loadTabsOnce() {
  if (!navLoaded.value) return
  if (!systemAvailable.value) {
    loadError.value = 'System is not available for this account.'
    tabs.value = []
    return
  }
  try {
    const { data } = await api.get('/api/v1/settings/tabs')
    if (data?.success) {
      tabs.value = (data.tabs as TabDef[]).filter(renderable)
      loadError.value = ''
      applyRouteTab()
    }
  } catch (error) {
    loadError.value = tabLoadMessage(error)
    tabs.value = []
  }
}

// Visibility can switch back to a retained buffer before its initial request
// settles. Keep one request in flight and run at most one follow-up, so the
// final response is current without overlapping responses racing to replace
// the active tab selection. Registry events retain their debounced ladder.
function loadTabs(): Promise<void> {
  if (tabsLoad) {
    tabsReloadQueued = true
    return tabsLoad
  }
  tabsLoad = (async () => {
    do {
      tabsReloadQueued = false
      await loadTabsOnce()
    } while (tabsReloadQueued)
  })().finally(() => { tabsLoad = null })
  return tabsLoad
}

watch([navLoaded, systemAvailable], () => { void loadTabs() })

onMounted(() => {
  void loadNav()
  void loadTabs()
  window.addEventListener('kickside:nav-changed', scheduleTabsRefresh)
  window.addEventListener('kickside:modules-changed', scheduleTabsRefresh)
  window.addEventListener(REGISTRY_CHANGED_EVENT, scheduleTabsRefresh)
})

onUnmounted(() => {
  clearTabRefreshTimers()
  window.removeEventListener('kickside:nav-changed', scheduleTabsRefresh)
  window.removeEventListener('kickside:modules-changed', scheduleTabsRefresh)
  window.removeEventListener(REGISTRY_CHANGED_EVENT, scheduleTabsRefresh)
})
</script>

<template>
  <div class="system-page">
    <div class="system-chrome">
      <div class="system-chrome-inner">
      <div class="page-head system-head">
        <div class="page-head-icon"><Icon icon="tabler:settings" aria-hidden="true" /></div>
        <div class="page-head-text">
          <h1 class="page-title">System</h1>
          <p class="page-sub">Users, modules, and configuration.</p>
        </div>
        <div v-if="headerLinks.length" class="system-head-links">
          <a
            v-for="link in headerLinks"
            :key="link.key"
            :href="link.url"
            @click="navigateHeaderLink($event, link.url!)"
            class="system-head-link"
          >
            <Icon :icon="link.icon" class="w-4 h-4" aria-hidden="true" />
            {{ link.label }}
            <Icon icon="tabler:external-link" class="w-3.5 h-3.5 opacity-60" aria-hidden="true" />
          </a>
        </div>
      </div>

      <Tabs
        class="system-tabs"
        data-kx-separator="surface"
        :value="active"
        @update:value="selectTab(String($event))"
      >
        <TabList aria-label="System sections">
          <Tab v-for="tab in navTabs" :key="tab.key" :value="tab.key">
            <Icon :icon="tab.icon" aria-hidden="true" />
            {{ tab.label }}
          </Tab>
        </TabList>
      </Tabs>
      </div>
    </div>

    <div class="system-viewport">
      <div v-if="loadError" class="p-6 text-sm" style="color: var(--p-danger-500)">
        {{ loadError }}
      </div>
      <WcSurface v-else-if="activeTag" :tag="activeTag" :path="route.path" :visible="surfaceActive" :key="activeTag" />
      <KeepAlive v-else>
        <component :is="activeComponent" v-if="activeComponent" :key="active" embedded />
      </KeepAlive>
    </div>
  </div>
</template>

<style scoped>
.system-page {
  --kickside-system-surface-gutter: 24px;
  height: 100%;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.system-chrome {
  flex: 0 0 auto;
  border-bottom: 1px solid var(--p-content-border-color);
}

.system-chrome-inner {
  width: 100%;
  margin: 0;
  padding: 20px var(--kickside-system-surface-gutter) 0;
  box-sizing: border-box;
}

.system-head {
  padding: 0 0 12px;
}

.system-head-links {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

.system-head-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  color: var(--p-text-color);
  border: 1px solid var(--p-content-border-color);
  background: var(--p-content-background);
  transition: background-color 0.15s, border-color 0.15s;
}

/* Boxed: it draws a border and a fill at rest, so the ring is that border
   going primary plus the halo - never an outline, which would stack with the
   border. Focus canon: app/facade-src/README.md. */
.system-head-link:focus-visible {
  border-color: var(--p-focus-ring-color);
  outline: none;
  box-shadow: var(--p-focus-ring-shadow);
}

.system-head-link:hover {
  border-color: var(--p-primary-color);
  color: var(--p-primary-color);
}

/* Geometry and the pull onto the separator come from the facade's shared tab
   rule; TabList scrolls its own viewport, so the row needs nothing here. */

.system-viewport {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

@media (max-width: 640px) {
  .system-page {
    --kickside-system-surface-gutter: 16px;
  }
}
</style>

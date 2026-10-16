import { ref, computed } from 'vue'
import type { Component } from 'vue'
import { useApi } from './useWippy'
import { subscribeComponentMeta, type ComponentMetaEvent, type MetaFieldTypes } from '@widgets/app/componentRealtime'

// A live badge bound to a component-meta field, resolved by the backend nav_badges
// resolver and kept current over the ONE existing user websocket (no extra backend
// subscription). `value` is the coerced field; `tone` is the current effective tone
// (base_tone, or active_tone while tone_field is truthy).
export interface NavBadge {
  value?: number
  component_id: string
  field: string
  field_type: string
  style: string
  hide_zero: boolean
  tone: string
  base_tone: string
  active_tone?: string
  tone_field?: string
}

// A surface is a navigable area of the app. Surfaces are declared in the backend
// registry as ui.nav_item entries; kickside/ui merges them with admin system
// controls (layout, overrides, categories, custom items) and serves the
// effective navigation. The SPA only knows how to RENDER a given route_name, not
// which surfaces or categories exist — the app is assembled from registry data.
export interface NavItem {
  id: string
  label: string
  icon: string
  path: string
  route_name: string
  category: string
  order: number
  source?: string
  hidden?: boolean
  // How the surface renders, declared on the nav_item (mirrors ui.settings_tab):
  // 'surface' resolves a renderer the bundle ships (by `surface`, default
  // route_name); 'component' mounts the registry-declared web component
  // `component_tag` — a module-owned surface ships its UI and needs no app code.
  render?: string
  surface?: string
  component_tag?: string
  badge?: NavBadge
}

// A category is a group of nav items declared by an admin (or the implicit root
// bucket, key ""). It nests child surfaces under an optional, collapsible title.
export interface NavCategory {
  key: string
  label: string
  icon?: string
  order: number
  collapsed: boolean
  items: NavItem[]
  // Derived client-side (renderableCategories only): the aggregate of the visible
  // children's badges, shown on the header when the children are hidden.
  rollup?: NavBadge | null
}

export type NavLayout = 'vertical' | 'horizontal'

// Renderers the app bundle itself ships, keyed by surface name. These back the
// app-owned surfaces (and the System tabs). Module-owned surfaces are NOT listed
// here — they declare render: component on their nav_item and mount their own web
// component by tag, so the app needs no code per module.
const surfaceRenderers: Record<string, () => Promise<Component>> = {
  system: () => import('../pages/system.vue').then(m => m.default),
}

const componentTagPattern = /^[a-z][a-z0-9]*-[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/

export function isComponentTag(tag: unknown): tag is string {
  return typeof tag === 'string' && tag.length <= 80 && componentTagPattern.test(tag)
}

// hasRenderer/loadRenderer resolve a bundle-shipped surface by name (used by the
// System tabs and app-owned nav items).
export function hasRenderer(surface: string): boolean {
  return surface in surfaceRenderers
}

export function loadRenderer(surface: string): Promise<Component> | null {
  const loader = surfaceRenderers[surface]
  return loader ? loader() : null
}

// canRender decides whether a nav item is renderable in this bundle: a component
// surface needs its tag; a surface needs a bundle renderer for its surface name.
export function canRender(item: NavItem): boolean {
  if (item.render === 'component') return isComponentTag(item.component_tag)
  return hasRenderer(item.surface || item.route_name)
}

// badgeVisible is the single display predicate (mirrors the server ui_types
// badge_visible): a count needs a numeric value and hides at 0 when hide_zero; a
// dot shows on presence and hides an explicit 0 when hide_zero.
export function badgeVisible(b: NavBadge): boolean {
  if (b.style === 'dot') {
    if (typeof b.value !== 'number') return true
    return !(b.hide_zero && b.value === 0)
  }
  if (typeof b.value !== 'number') return false
  return !(b.hide_zero && b.value === 0)
}

// A tone names a soft-tint background + readable foreground token pair — never an
// ad-hoc color. Unknown tones fall back to neutral.
const badgeToneTokens: Record<string, { bg: string; fg: string }> = {
  neutral: { bg: 'var(--kx-surface-2)', fg: 'var(--p-text-muted-color)' },
  accent: { bg: 'var(--kx-wash-primary)', fg: 'var(--p-primary-color)' },
  success: { bg: 'var(--kx-wash-success)', fg: 'var(--p-success-700)' },
  info: { bg: 'var(--kx-wash-info)', fg: 'var(--p-info-700)' },
  warn: { bg: 'var(--kx-wash-warn)', fg: 'var(--p-warn-700)' },
  danger: { bg: 'var(--kx-wash-danger)', fg: 'var(--p-danger-700)' },
}

export function badgeStyle(b: NavBadge): Record<string, string> {
  const t = badgeToneTokens[b.tone] || badgeToneTokens.neutral
  return { background: t.bg, color: t.fg }
}

// Apply a coerced component.meta.changed payload to a live badge in place: update
// the bound field value, and re-evaluate the tone from the boolean tone_field
// (never inferred from the count).
export function applyBadgeMeta(b: NavBadge, meta: Record<string, unknown>): void {
  if (b.field in meta) {
    const v = meta[b.field]
    if (typeof v === 'number') b.value = v
    else if (v === null || v === undefined) b.value = undefined
  }
  if (b.tone_field && b.tone_field in meta) {
    const active = meta[b.tone_field] === true
    b.tone = active ? (b.active_tone ?? b.base_tone) : b.base_tone
  }
}

// rollupBadge derives a category's aggregate badge purely from its visible
// children's badges: SUM the count values; a dot when only dot children are
// present. hide_zero applies to the sum, and an active child bubbles its active
// tone up. Returns null when no child carries a badge.
export function rollupBadge(items: NavItem[]): NavBadge | null {
  let sum = 0
  let hasNumeric = false
  let present = false
  let anyActive = false
  let baseTone = 'neutral'
  let activeTone: string | undefined
  for (const it of items) {
    const b = it.badge
    if (!b) continue
    present = true
    if (b.base_tone) baseTone = b.base_tone
    if (b.active_tone) activeTone = b.active_tone
    if (b.active_tone && b.tone === b.active_tone) anyActive = true
    if (typeof b.value === 'number') {
      hasNumeric = true
      sum += b.value
    }
  }
  if (!present) return null
  return {
    value: hasNumeric ? sum : undefined,
    component_id: '',
    field: '',
    field_type: 'integer',
    style: hasNumeric ? 'count' : 'dot',
    hide_zero: true,
    tone: anyActive ? (activeTone ?? 'danger') : baseTone,
    base_tone: baseTone,
    active_tone: activeTone,
  }
}

type SubscribeFn = (
  componentId: string,
  cb: (event: ComponentMetaEvent) => void,
  fieldTypes?: MetaFieldTypes,
) => (() => void) | null

// installBadgeSubscriptions wires the rendered nav badges to live component meta,
// deduped by component_id: several badges on the same component share one handler
// over the existing socket. Returns the teardown list. subscribe is injectable for
// tests.
export function installBadgeSubscriptions(
  cats: NavCategory[],
  subscribe: SubscribeFn = subscribeComponentMeta,
): Array<() => void> {
  const groups = new Map<string, { badges: NavBadge[]; fieldTypes: MetaFieldTypes }>()
  for (const cat of cats) {
    for (const it of cat.items) {
      const b = it.badge
      if (!b || !b.component_id) continue
      let g = groups.get(b.component_id)
      if (!g) {
        g = { badges: [], fieldTypes: {} }
        groups.set(b.component_id, g)
      }
      g.badges.push(b)
      g.fieldTypes[b.field] = b.field_type
      if (b.tone_field) g.fieldTypes[b.tone_field] = 'boolean'
    }
  }
  const unsubs: Array<() => void> = []
  for (const [componentId, g] of groups) {
    const off = subscribe(
      componentId,
      (event) => {
        for (const b of g.badges) applyBadgeMeta(b, event.meta)
      },
      g.fieldTypes,
    )
    if (off) unsubs.push(off)
  }
  return unsubs
}

const navItems = ref<NavItem[]>([])
const categories = ref<NavCategory[]>([])
// Live badge subscriptions over the existing socket, torn down and rebuilt on each
// nav (re)load so a reload never leaks handlers.
let badgeUnsubs: Array<() => void> = []
const layout = ref<NavLayout>('vertical')
// Admin-configured landing path: where "/" redirects to. Empty = no redirect.
const home = ref('')
const loaded = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)

// The once-only splash resolved by the backend on /nav/list (null
// when none pending). "Seen" is recorded server-side via dismissSplash — never in
// localStorage — once per user or once per instance, by the splash's scope.
export interface SplashStep { id: string; order?: number; chip?: string; title?: string; subtitle?: string; icon?: string; component_tag?: string; optional?: boolean; field?: string; placeholder?: string }
export interface SplashInfo { id: string; presentation?: 'fullscreen' | 'dialog'; component_tag?: string; title?: string; icon?: string; steps?: SplashStep[] }
const splash = ref<SplashInfo | null>(null)
const splashError = ref('')
const splashSaving = ref(false)
let splashRevision = 0

function loadErrorMessage(): string {
  return 'Navigation unavailable.'
}

export function useSurfaces() {
  const api = useApi()

  async function loadNav(force = false): Promise<void> {
    if ((loaded.value && !force) || loading.value) return
    loading.value = true
    const requestSplashRevision = splashRevision
    try {
      const { data } = await api.get('/api/v1/nav/list')
      if (data.success) {
        navItems.value = Array.isArray(data.items) ? data.items : []
        categories.value = Array.isArray(data.categories) ? data.categories : []
        layout.value = data.layout === 'horizontal' ? 'horizontal' : 'vertical'
        home.value = typeof data.home === 'string' ? data.home : ''
        if (requestSplashRevision === splashRevision && !splash.value) {
          splash.value = (data.splash && typeof data.splash.id === 'string') ? data.splash : null
        }
        error.value = null
        for (const off of badgeUnsubs) off()
        badgeUnsubs = installBadgeSubscriptions(categories.value)
      }
    } catch {
      navItems.value = []
      categories.value = []
      error.value = loadErrorMessage()
    } finally {
      loaded.value = true
      loading.value = false
    }
  }

  // Re-fetch after a nav config change or a hub plugin install/remove so new
  // surfaces and control changes appear without a reload.
  function reloadNav(): Promise<void> {
    return loadNav(true)
  }

  // Dismiss the current splash only after the server confirms it was recorded as
  // seen. On failure keep it open and expose an inline error so the user can retry.
  async function dismissSplash(): Promise<void> {
    const cur = splash.value
    if (!cur?.id || splashSaving.value) return

    splashError.value = ''
    splashSaving.value = true
    try {
      const { data } = await api.post(`/api/v1/ui/splash/${encodeURIComponent(cur.id)}/seen`)
      if (data?.success !== true) {
        if (splash.value?.id === cur.id) {
          const message = data?.error
          splashError.value = typeof message === 'string' && message.trim()
            ? message
            : 'Could not save setup completion. Please try again.'
        }
        return
      }
      splashRevision++
      if (splash.value?.id === cur.id) splash.value = null
    } catch (cause) {
      const response = (cause as { response?: { data?: { error?: unknown } } } | null)?.response
      const message = response?.data?.error
      if (splash.value?.id === cur.id) {
        splashError.value = typeof message === 'string' && message.trim()
          ? message
          : 'Could not save setup completion. Please try again.'
      }
    } finally {
      splashSaving.value = false
    }
  }

  async function advanceSplash(): Promise<void> {
    const current = splash.value
    await dismissSplash()
    if (!current || splash.value) return
    try {
      const { data } = await api.get('/api/v1/nav/list')
      if (data?.success !== true) throw new Error(data?.error || 'Could not load the next setup step.')
      splashRevision++
      splash.value = data.splash && typeof data.splash.id === 'string' ? data.splash : null
    } catch (cause) {
      splash.value = current
      splashError.value = cause instanceof Error ? cause.message : String(cause)
    }
  }

  // Categories holding at least one renderable (or linkable) surface. A category
  // whose items the bundle cannot render is dropped from the rail.
  const renderableCategories = computed<NavCategory[]>(() =>
    categories.value
      .map((c) => {
        const items = c.items.filter(i => canRender(i) || !!i.path)
        // rollup reads the children's live badge values, so it recomputes whenever
        // a child badge updates from its subscription — no extra socket work.
        return { ...c, items, rollup: rollupBadge(items) }
      })
      .filter(c => c.items.length > 0),
  )

  // Surfaces the running bundle can actually render — the landing lists these.
  const renderableItems = computed<NavItem[]>(() =>
    navItems.value.filter(i => canRender(i)),
  )

  return {
    navItems,
    categories,
    renderableCategories,
    renderableItems,
    layout,
    home,
    splash,
    splashError,
    splashSaving,
    loaded,
    loading,
    error,
    loadNav,
    reloadNav,
    dismissSplash,
    advanceSplash,
  }
}

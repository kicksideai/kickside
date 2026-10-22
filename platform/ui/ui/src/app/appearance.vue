<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { api, host, on } from '@wippy-fe/proxy'
import { useHostVisibilityRefresh } from '@wippy-fe/webcomponent-vue'
import IconField from '@widgets/app/IconField.vue'
import ColorPicker from 'primevue/colorpicker'
import { DEFAULT_TONE_FALLBACK, buildToneCss, buildDefaultToneCss, evaluateTone } from './appearance_tone'
import type { Item, Category, Override } from './appearance.types.ts'
import { useAppearanceNavigation } from './useAppearanceNavigation.ts'
import { useAppearanceBranding } from './useAppearanceBranding.ts'

// Appearance — a visual editor for the navigation your modules declare. Choose a
// layout, rename and re-icon surfaces and categories, then drag them into the
// shape you want. Everything writes through kickside.ui settings (cached,
// validated) and broadcasts on save, so every open UI updates in realtime.
//
// Standalone WC: the authenticated API is the synchronous `@wippy-fe/proxy` import.
// No SPA composables, no page-title header (System owns the page header + tab
// strip) — only the editor content and its own Save/Discard toolbar; styled with
// the universal --p-* theme vocabulary so it renders in any host's shadow DOM.

const loading = ref(true)
const saving = ref(false)
const error = ref('')

// Surface the server's structured error ({ error } in the JSON body) rather than
// axios's generic "Request failed with status code N".
function apiError(e: any, fallback: string): string {
  return e?.response?.data?.error || e?.message || fallback
}

const layout = ref<'vertical' | 'horizontal'>('vertical')
type ThemeMode = 'auto' | 'light' | 'dark'
const themeMode = ref<ThemeMode>(host.getThemeMode?.() ?? 'auto')
const items = ref<Item[]>([])
const cats = ref<Category[]>([])
const overrides = ref<Record<string, Override>>({})
const showHidden = ref(false)

// Branding (site title + logo), stored as kickside.ui settings alongside the nav
// controls and saved through the same PUT /nav/config path.
const title = ref('')
const logoUrl = ref('')
const logoUpload = ref<{ max_bytes: number, formats: { label: string, mime: string, extensions: string[] }[] }>()
const logoAccept = computed(() => logoUpload.value?.formats.flatMap(f => [f.mime, ...f.extensions.map(ext => `.${ext}`)]).join(','))
const logoHint = computed(() => logoUpload.value
  ? `${logoUpload.value.formats.map(f => f.label).join(', ')} · up to ${logoUpload.value.max_bytes / 1048576} MB.`
  : '')
const branding = useAppearanceBranding({ logoUrl, error, apiError })
const { uploadingLogo, uploadLogo, removeLogo } = branding

// Base tone: the primary color, stored as a kickside.ui setting and applied by the
// facade resolver. Empty = the built-in default ramp. The native color picker needs
// a concrete value, so while the setting is unset it shows the live theme token.
const primaryColor = ref('')
const defaultTone = ref(DEFAULT_TONE_FALLBACK)
const pickerColor = computed({
  // PrimeVue's <ColorPicker format="hex"> exchanges a BARE rrggbb string, while the stored
  // setting and the hex text field both keep the #-prefixed form — so strip on the way in
  // and re-add on the way out. Falling back to defaultTone keeps the swatch showing the live
  // theme tone while the setting is unset.
  get: () => (primaryColor.value || defaultTone.value).trim().replace(/^#/, ''),
  set: (v: string) => {
    const hex = String(v ?? '').replace(/^#/, '')
    primaryColor.value = hex ? `#${hex}` : ''
  },
})
function clearTone() { primaryColor.value = '' }

function setThemeMode(mode: ThemeMode) {
  themeMode.value = mode
  host.setThemeMode(mode)
}

// Guards on the custom tone. Empty (default ramp) is always fine. A syntactically invalid
// hex (evaluateTone → null on a non-empty value) or an illegible tone (near-white/-black)
// both block Save and show a warning; the preview still applies so the admin sees WHY (the
// warning is danger-colored, not primary, so it stays readable even when the tone is bad).
const toneReport = computed(() => (primaryColor.value.trim() ? evaluateTone(primaryColor.value) : null))
const toneInvalid = computed(() => !!primaryColor.value.trim() && toneReport.value === null)
const toneBlocked = computed(() => toneInvalid.value || (!!toneReport.value && !toneReport.value.ok))
const toneWarning = computed(() =>
  toneInvalid.value
    ? 'Enter a valid hex color, e.g. #2563eb.'
    : (toneReport.value && !toneReport.value.ok ? toneReport.value.reason : ''))

// Home page: the surface path users land on at "/". Stored as a single kickside.ui
// setting (like title/logo), matched to a surface by its path.
const home = ref('')
// Baseline snapshot for dirty detection. Label/icon edits live inside overrides
// (items) and cats (categories), so tracking those two captures every change.
const baseline = ref('')
const snapshot = () => JSON.stringify({
  layout: layout.value, cats: cats.value, overrides: overrides.value,
  title: title.value, logo: logoUrl.value, home: home.value, tone: primaryColor.value,
  pos: items.value.map(i => [i.id, i.category, i.order, !!i.hidden]),
})
const dirty = computed(() => snapshot() !== baseline.value)

async function load(): Promise<boolean> {
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.get('/api/v1/nav/list?manage=1')
    if (!data.success) throw new Error(data.error || 'failed to load nav')
    logoUpload.value = data.logo_upload
    items.value = (data.items ?? []).map((i: Item) => ({ ...i }))
    layout.value = data.layout === 'horizontal' ? 'horizontal' : 'vertical'
    const cfg = data.config ?? {}
    cats.value = Array.isArray(cfg.categories) ? cfg.categories.map((c: Category) => ({ ...c })) : []
    overrides.value = (cfg.overrides && typeof cfg.overrides === 'object') ? structuredClone(cfg.overrides) : {}
    title.value = typeof cfg.title === 'string' ? cfg.title : ''
    logoUrl.value = typeof cfg.logo_url === 'string' ? cfg.logo_url : ''
    primaryColor.value = typeof cfg.primary_color === 'string' ? cfg.primary_color : ''
    committedTone = primaryColor.value // baseline tone an unsaved preview reverts to
    home.value = typeof data.home === 'string' ? data.home : (typeof cfg.home === 'string' ? cfg.home : '')
    baseline.value = snapshot()
    return true
  } catch (e: any) {
    error.value = apiError(e, 'failed to load')
    return false
  } finally {
    loading.value = false
  }
}

const navigation = useAppearanceNavigation({ items, categories: cats, overrides, home })
const {
  itemKey, patchOverride, setHidden, setCategory, setOrder, setLabel, setIcon, hasOverride,
  orderedCats, itemsOf, editorGroups, hiddenItems, catByKey,
  dragItemId, dragCatKey, overGroup, onItemDragStart, endDrag, onItemDrop, onGroupDrop,
  onCatDragStart, onCatDrop, addCategory, removeCategory, renameCategory, setCatIcon,
  isHome, setHome,
} = navigation

// Replay instance setup without clearing any personal splash completion.
// nav-changed makes the host re-fetch /nav/list, which re-resolves the splash
// and shows it over the app (no page reload).
const resetting = ref(false)
const replayed = ref(false)
async function replaySetup() {
  resetting.value = true
  error.value = ''
  try {
    const { data } = await api.delete('/api/v1/ui/splash/seen')
    if (data?.success !== true) throw new Error(data?.error || 'could not reset setup')
    replayed.value = true
    window.dispatchEvent(new CustomEvent('kickside:nav-changed'))
  } catch (e: any) {
    error.value = apiError(e, 'could not reset setup')
  } finally {
    resetting.value = false
  }
}

// ── Base tone delivery (live preview + saved) ────────────────────────────────
// The facade web-host bakes the tone into every web-component shadow at boot and exposes
// no live config-update API, so a changed tone (unsaved preview OR just-saved) would
// otherwise only apply on a full reload. The editor emits only the selected --p-primary
// as CSS on `kickside:tone-apply`; the shell owns applying it to the host document
// and every web-component shadow — current and newly mounted — which is the shell's job
// (it already owns app-wide branding). This drives both the live preview and the
// saved tone with no reload and no cross-shadow reach-in from this module. On a clean
// leave we re-emit the last committed (saved) tone so unsaved edits revert.
let toneTimer: ReturnType<typeof setTimeout> | null = null
let disposed = false
let committedTone = '' // the last saved tone; what an unsaved preview reverts to on leave
// The facade's static default css-variables (served at /app), used to preview/apply the
// built-in ramp on "Reset to default" — clearing the overlay would only revert to the
// boot-delivered SAVED tone, not the default. Fetched once; falls back to the seed ramp.
let defaultVars: Record<string, unknown> | null = null

async function loadDefaultTone() {
  try {
    const res = await fetch('/app/css-variables.facade.json', { cache: 'no-store' })
    if (!res.ok) return
    const json = await res.json()
    if (json && typeof json === 'object') {
      defaultVars = json
      const seed = (json as Record<string, unknown>)['--p-primary']
      if (typeof seed === 'string') defaultTone.value = seed
      // If we're already showing the default (no custom tone set), re-emit now that we have
      // the exact static seed (this fetch may finish after the initial emit).
      if (!primaryColor.value.trim() && hostVisible.value !== false) emitTone('')
    }
  } catch { /* keep the fallback default seed */ }
}

// CSS for one root contains only --p-primary. Palette and role formulas stay owned by
// the facade stylesheet for custom tones and reset-to-default alike.
function toneCssFor(hex: string, root: ':root' | ':host'): string {
  return buildToneCss(hex, root)
    || buildDefaultToneCss(defaultVars, root)
    || buildToneCss(DEFAULT_TONE_FALLBACK, root)
}
function emitTone(hex: string) {
  window.dispatchEvent(new CustomEvent('kickside:tone-apply', {
    detail: { hostCss: toneCssFor(hex, ':root'), shadowCss: toneCssFor(hex, ':host') },
  }))
}

onBeforeUnmount(() => {
  disposed = true
  if (toneTimer) clearTimeout(toneTimer)
  emitTone(committedTone) // revert any unsaved preview to the last saved tone
  unsubscribeTheme?.()
})

async function save() {
  if (toneBlocked.value) return // guard: never persist an illegible tone
  const submitted = snapshot()
  const submittedTone = primaryColor.value
  saving.value = true
  error.value = ''
  try {
    const { data } = await api.put('/api/v1/nav/config', {
      layout: layout.value, overrides: overrides.value, categories: cats.value,
      title: title.value, logo_url: logoUrl.value, home: home.value,
      primary_color: primaryColor.value,
    })
    if (!data.success) throw new Error(data.error || 'save failed')
    baseline.value = submitted
    committedTone = submittedTone // a draft edited during this request is still unsaved
    // Re-assert in case a save→navigate-away race already reverted the overlay: if the user
    // left before this PUT resolved, onBeforeUnmount fired emitTone(pre-save committedTone).
    // The shell singleton still listens, so re-emitting converges it to the saved tone.
    emitTone(disposed || hostVisible.value === false ? committedTone : primaryColor.value)
  } catch (e: any) {
    error.value = apiError(e, 'save failed')
  } finally {
    saving.value = false
  }
}

let unsubscribeTheme: (() => void) | null = null
onMounted(() => {
  themeMode.value = host.getThemeMode?.() ?? 'auto'
  unsubscribeTheme = on('@theme', mode => { themeMode.value = mode })
  void loadDefaultTone() // the built-in default ramp (for the swatch + "Reset to default")
})

// Retained surfaces are hidden rather than unmounted. Preserve an unsaved editor
// draft across that transition, but never leave its global tone preview applied to
// unrelated pages. Clean surfaces refresh from the server when they are revealed;
// dirty surfaces keep their draft and re-apply its preview when the user returns.
let hasLoaded = false
async function refreshAppearance() {
  if (hasLoaded && dirty.value) return
  if (await load()) hasLoaded = true
}

const hostVisible = useHostVisibilityRefresh(refreshAppearance)

// Debounced live preview: mirror the picker onto the whole app only while this
// retained surface is logically visible.
watch(primaryColor, (hex) => {
  if (toneTimer) clearTimeout(toneTimer)
  toneTimer = null
  if (hostVisible.value === false) return
  toneTimer = setTimeout(() => emitTone(hex), 90)
})

watch(hostVisible, (visible, previous) => {
  if (previous === true && visible === false) {
    if (toneTimer) clearTimeout(toneTimer)
    toneTimer = null
    emitTone(committedTone)
  } else if (previous === false && visible === true && dirty.value) {
    emitTone(primaryColor.value)
  }
})
</script>

<template>
  <div class="ap">
    <!-- One scroll container holds the toolbar (sticky) + content, so the
         scrollbar narrows both equally and Save stays aligned with the content. -->
    <div class="ap-body">
      <header class="ap-bar">
        <span v-if="toneBlocked" class="ap-dirty ap-dirty-warn">{{ toneInvalid ? 'Invalid color' : 'Tone unreadable' }}</span>
        <span v-else-if="dirty" class="ap-dirty">Unsaved changes</span>
        <button class="ap-btn ap-btn-ghost" :disabled="!dirty || saving" @click="load">Discard</button>
        <button class="ap-btn ap-btn-primary" :disabled="!dirty || saving || toneBlocked" @click="save">
          <Icon :icon="saving ? 'tabler:loader-2' : 'tabler:device-floppy'" :class="saving && 'spin'" aria-hidden="true" />
          {{ saving ? 'Saving…' : 'Save' }}
        </button>
      </header>

      <div v-if="error" class="ap-msg ap-err">{{ error }}</div>
      <div v-if="loading" class="ap-loading"><Icon icon="tabler:loader-2" class="spin" /> Loading…</div>

      <div v-else class="ap-grid">
        <!-- Left rail: branding + layout + legend, sticky while the structure scrolls. -->
        <aside class="ap-side">
          <section class="ap-card">
            <header class="ap-h"><Icon icon="tabler:photo" aria-hidden="true" /> Branding</header>
            <p class="ap-sub">Title and logo apply to everyone on this installation — header, login page, and browser tab.</p>
            <label class="ap-blabel">Title</label>
            <input v-model="title" class="ap-binput" type="text" maxlength="60" placeholder="KickSide" />
            <label class="ap-blabel">Logo</label>
            <div class="ap-logo">
              <span class="ap-logo-prev">
                <img v-if="logoUrl" :src="logoUrl" alt="Logo preview" />
                <Icon v-else icon="tabler:photo" aria-hidden="true" />
              </span>
              <div class="ap-logo-actions">
                <label class="ap-btn ap-btn-ghost" :class="uploadingLogo && 'ap-btn-busy'">
                  <Icon :icon="uploadingLogo ? 'tabler:loader-2' : 'tabler:upload'" :class="uploadingLogo && 'spin'" aria-hidden="true" />
                  {{ uploadingLogo ? 'Uploading…' : 'Upload' }}
                  <input type="file" :accept="logoAccept" class="ap-file" :disabled="uploadingLogo || !logoUpload" @change="uploadLogo" />
                </label>
                <button v-if="logoUrl" class="ap-btn ap-btn-ghost ap-danger" @click="removeLogo">
                  <Icon icon="tabler:trash" aria-hidden="true" /> Remove
                </button>
              </div>
            </div>
            <p class="ap-hint">{{ logoHint }}</p>

            <label class="ap-blabel">Base tone</label>
            <div class="ap-tone">
              <ColorPicker
                v-model="pickerColor"
                format="hex"
                class="ap-tone-swatch"
                :pt="{ preview: { class: 'ap-tone-preview', 'aria-label': 'Base tone color', 'data-testid': 'appearance-base-tone-picker' } }"
              />
              <input v-model="primaryColor" class="ap-binput ap-tone-hex" type="text" maxlength="7" placeholder="Default" aria-label="Base tone hex" />
              <button v-if="primaryColor" class="ap-btn ap-btn-ghost" @click="clearTone"><Icon icon="tabler:rotate" aria-hidden="true" /> Reset</button>
            </div>
            <p v-if="toneWarning" class="ap-tone-warn" role="alert">
              <Icon icon="tabler:alert-triangle" aria-hidden="true" /> {{ toneWarning }}
            </p>
            <p class="ap-hint">Primary color for buttons, links and accents. Applies across the app instantly.</p>

            <label class="ap-blabel">Color scheme</label>
            <div class="ap-theme-modes" role="group" aria-label="Color scheme">
              <button
                v-for="option in ([
                  { mode: 'auto', label: 'Auto', icon: 'tabler:device-desktop' },
                  { mode: 'light', label: 'Light', icon: 'tabler:sun' },
                  { mode: 'dark', label: 'Dark', icon: 'tabler:moon' },
                ] as const)"
                :key="option.mode"
                type="button"
                class="ap-theme-mode"
                :class="themeMode === option.mode && 'ap-theme-mode-on'"
                :aria-pressed="themeMode === option.mode"
                @click="setThemeMode(option.mode)"
              >
                <Icon :icon="option.icon" aria-hidden="true" /> {{ option.label }}
              </button>
            </div>
            <p class="ap-hint">Auto follows your browser or operating system setting. Changes apply immediately.</p>
          </section>

          <section class="ap-card">
            <header class="ap-h"><Icon icon="tabler:layout-2" aria-hidden="true" /> Layout</header>
            <p class="ap-sub">Where navigation sits.</p>
            <div class="ap-layouts">
              <button class="ap-lo" :class="layout === 'vertical' && 'ap-lo-on'" @click="layout = 'vertical'">
                <span class="mock mock-v"><span class="mock-rail"><i /><i /><i /></span><span class="mock-fill" /></span>
                <span class="ap-lo-name">Vertical <Icon v-if="layout === 'vertical'" icon="tabler:circle-check-filled" aria-hidden="true" /></span>
                <span class="ap-lo-desc">Sidebar rail</span>
              </button>
              <button class="ap-lo" :class="layout === 'horizontal' && 'ap-lo-on'" @click="layout = 'horizontal'">
                <span class="mock mock-h"><span class="mock-top"><i /><i /><i /></span><span class="mock-fill" /></span>
                <span class="ap-lo-name">Horizontal <Icon v-if="layout === 'horizontal'" icon="tabler:circle-check-filled" aria-hidden="true" /></span>
                <span class="ap-lo-desc">Top bar</span>
              </button>
            </div>
          </section>

          <section class="ap-card ap-legend">
            <header class="ap-h"><Icon icon="tabler:info-circle" aria-hidden="true" /> How it works</header>
            <ul class="ap-tips">
              <li><Icon icon="tabler:grip-vertical" aria-hidden="true" /> Drag to reorder or move between categories.</li>
              <li><Icon icon="tabler:cursor-text" aria-hidden="true" /> Click a label to rename it.</li>
              <li><Icon icon="tabler:mood-smile" aria-hidden="true" /> Click an icon to pick a new Tabler glyph.</li>
              <li><Icon icon="tabler:eye-off" aria-hidden="true" /> Hide a surface without removing its module.</li>
            </ul>
          </section>

          <section class="ap-card">
            <header class="ap-h"><Icon icon="tabler:rocket" aria-hidden="true" /> Setup</header>
            <p class="ap-sub">Reopen setup for this installation. Once completed, it stays closed for everyone.</p>
            <button class="ap-btn ap-btn-ghost" :disabled="resetting" @click="replaySetup">
              <Icon :icon="resetting ? 'tabler:loader-2' : 'tabler:refresh'" :class="resetting && 'spin'" aria-hidden="true" />
              {{ resetting ? 'Resetting…' : 'Show setup again' }}
            </button>
            <p v-if="replayed" class="ap-hint">Setup will appear now, or next time the app loads.</p>
          </section>
        </aside>

        <!-- Structure tree: the wide working area. -->
        <section class="ap-card ap-structure">
          <header class="ap-h">
            <Icon icon="tabler:sitemap" aria-hidden="true" /> Structure
            <button class="ap-btn ap-btn-ghost ap-add" @click="addCategory"><Icon icon="tabler:folder-plus" aria-hidden="true" /> Add category</button>
          </header>

          <div
            v-for="g in editorGroups"
            :key="g.key || '_root'"
            class="ap-group"
            :class="overGroup === g.key && 'ap-group-over'"
            @dragover.prevent="overGroup = g.key"
            @dragleave="overGroup === g.key && (overGroup = null)"
            @drop.prevent="onGroupDrop(g.key)"
          >
            <div
              class="ap-group-head"
              @dragover.prevent
              @drop.prevent.stop="g.real ? onCatDrop(g.key) : onGroupDrop(g.key)"
            >
              <span
                v-if="g.real"
                class="ap-grip ap-grip-cat"
                draggable="true"
                title="Drag to reorder category"
                @dragstart="onCatDragStart(g.key, $event)"
                @dragend="endDrag"
              ><Icon icon="tabler:grip-vertical" aria-hidden="true" /></span>
              <span v-else class="ap-grip ap-grip-ghost" aria-hidden="true"></span>

              <template v-if="g.real">
                <IconField :model-value="catByKey(g.key)?.icon || ''" fallback="tabler:folder" @update:model-value="(v: string) => setCatIcon(g.key, v)" />
                <input
                  :value="catByKey(g.key)?.label"
                  class="ap-field ap-field-strong"
                  aria-label="Category name"
                  placeholder="Category name"
                  @input="renameCategory(g.key, ($event.target as HTMLInputElement).value)"
                />
              </template>
              <template v-else>
                <span class="ap-tile ap-tile-muted"><Icon icon="tabler:layout-list" aria-hidden="true" /></span>
                <span class="ap-field ap-field-strong ap-field-static">{{ g.label }}</span>
              </template>

              <span class="ap-count">{{ itemsOf(g.key).length }}</span>
              <button v-if="g.real" class="ap-icon-btn ap-danger" aria-label="Remove category" title="Remove category" @click="removeCategory(g.key)"><Icon icon="tabler:trash" aria-hidden="true" /></button>
            </div>

            <div v-if="itemsOf(g.key).length === 0" class="ap-drop-hint">Drag a surface here</div>
            <div
              v-for="it in itemsOf(g.key)"
              :key="it.id"
              class="ap-row"
              :class="dragItemId === it.id && 'ap-row-dragging'"
              @dragover.prevent.stop
              @drop.prevent.stop="onItemDrop(it)"
            >
              <span
                class="ap-grip"
                draggable="true"
                title="Drag to reorder or move"
                @dragstart="onItemDragStart(it, $event)"
                @dragend="endDrag"
              ><Icon icon="tabler:grip-vertical" aria-hidden="true" /></span>
              <IconField :model-value="it.icon || ''" fallback="tabler:square" @update:model-value="(v: string) => setIcon(it, v)" />
              <input
                :value="it.label"
                class="ap-field ap-field-strong"
                aria-label="Surface label"
                placeholder="Label"
                @input="setLabel(it, ($event.target as HTMLInputElement).value)"
              />
              <span class="ap-path">{{ it.path }}</span>
              <span v-if="it.source === 'custom'" class="ap-pill kx-tag-sm">custom</span>
              <span v-if="isHome(it)" class="ap-pill kx-tag-sm ap-pill-home"><Icon icon="tabler:home" aria-hidden="true" /> home</span>
              <Icon v-if="hasOverride(it)" icon="tabler:pencil" class="ap-edited" title="Customized — reset the field to revert" aria-hidden="true" />
              <button
                class="ap-icon-btn"
                :class="isHome(it) && 'ap-home-on'"
                :aria-label="isHome(it) ? 'Home page (click to unset)' : 'Set as home page'"
                :title="isHome(it) ? 'Home page — click to unset' : 'Set as home page'"
                @click="setHome(it)"
              ><Icon :icon="isHome(it) ? 'tabler:home-filled' : 'tabler:home'" aria-hidden="true" /></button>
              <button class="ap-icon-btn" aria-label="Hide" title="Hide" @click="setHidden(it, true)"><Icon icon="tabler:eye" aria-hidden="true" /></button>
            </div>
          </div>

          <!-- Hidden tray -->
          <div v-if="hiddenItems.length" class="ap-hidden">
            <button class="ap-hidden-h" @click="showHidden = !showHidden">
              <Icon :icon="showHidden ? 'tabler:chevron-down' : 'tabler:chevron-right'" aria-hidden="true" />
              <Icon icon="tabler:eye-off" aria-hidden="true" /> Hidden ({{ hiddenItems.length }})
            </button>
            <div v-if="showHidden" class="ap-hidden-list">
              <div v-for="it in hiddenItems" :key="it.id" class="ap-row ap-row-off">
                <span class="ap-grip ap-grip-ghost" aria-hidden="true"></span>
                <span class="ap-tile"><Icon :icon="it.icon || 'tabler:square'" aria-hidden="true" /></span>
                <span class="ap-field ap-field-strong ap-field-static">{{ it.label }}</span>
                <button class="ap-icon-btn" aria-label="Show" title="Show" @click="setHidden(it, false)"><Icon icon="tabler:eye-plus" aria-hidden="true" /></button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

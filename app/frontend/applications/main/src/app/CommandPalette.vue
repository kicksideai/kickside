<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useWippy } from '../composables/useWippy'
import { useContributions, type Contribution } from '../composables/useContributions'
import { isComponentTag } from '../composables/useSurfaces'
import { resolveNavTarget } from '../router/path'

// Commands are a UI contribution (meta.type ui.command) discovered through the
// generic contributions seam. component_tag/hotkey/scope are kind-specific fields
// carried on the record; read them as strings.
const str = (v: unknown): string => (typeof v === 'string' ? v : '')

// Shell-level command palette. Opens on a global hotkey (mod+K) above the whole
// layout, lists the registry-declared ui.command actions, and on invoke mounts
// the command's web component (component_tag) inside the panel. The palette is a
// generic mount-by-tag DRIVER: which component renders is swappable per registry
// entry. Context flows in via attributes; the component drives the shell back via
// CustomEvents (navigate / close / result), mirroring the WcSurface bridge.
const route = useRoute()
const router = useRouter()
const wippy = useWippy()
const { get, load } = useContributions()
const commands = computed<Contribution[]>(() => get('ui.command'))

const open = ref(false)
const query = ref('')
const selected = ref(0)
const active = ref<Contribution | null>(null)
const mountError = ref(false)
const searchRef = ref<HTMLInputElement | null>(null)
const hostRef = ref<HTMLElement | null>(null)
let activeEl: HTMLElement | null = null

const isMac = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return commands.value
  return commands.value.filter(c =>
    str(c.label).toLowerCase().includes(q) || str(c.description).toLowerCase().includes(q))
})

// Render a chord (mod+shift+k) as platform keycaps for display.
function prettyChord(chord: string): string[] {
  if (!chord) return []
  return chord.split('+').map((t) => {
    if (t === 'mod') return isMac ? '⌘' : 'Ctrl'
    if (t === 'shift') return isMac ? '⇧' : 'Shift'
    if (t === 'alt') return isMac ? '⌥' : 'Alt'
    return t.length === 1 ? t.toUpperCase() : t.charAt(0).toUpperCase() + t.slice(1)
  })
}

// Does a keydown match a chord like "mod+k"? "mod" = Cmd on macOS, Ctrl else.
function matchChord(e: KeyboardEvent, chord: string): boolean {
  const parts = chord.split('+')
  const key = parts[parts.length - 1]
  const mods = new Set(parts.slice(0, -1))
  const wantMod = mods.has('mod') || mods.has('ctrl') || mods.has('cmd')
  const modActive = isMac ? e.metaKey : e.ctrlKey
  if (wantMod !== modActive) return false
  if (mods.has('shift') !== e.shiftKey) return false
  if (mods.has('alt') !== e.altKey) return false
  return e.key.toLowerCase() === key
}

function openPalette() {
  open.value = true
  active.value = null
  mountError.value = false
  query.value = ''
  selected.value = 0
  nextTick(() => searchRef.value?.focus())
}

function close() {
  teardownEl()
  open.value = false
  active.value = null
  query.value = ''
}

function invoke(cmd: Contribution | undefined) {
  if (!cmd) return
  if (!isComponentTag(str(cmd.component_tag))) { mountError.value = true; active.value = cmd; open.value = true; return }
  active.value = cmd
  open.value = true
  mountError.value = false
  nextTick(mountActive)
}

function back() {
  teardownEl()
  active.value = null
  mountError.value = false
  nextTick(() => searchRef.value?.focus())
}

// ── Mount-by-tag driver (mirrors WcSurface) ─────────────────────────────
// Same navigation rule as every surface (resolveNavTarget): absolute path =
// cross-surface route, relative = in-surface. The palette has no surface base, so
// relatives resolve at root; absolutes pass through unchanged.
function onElNavigate(e: Event) {
  const d = (e as CustomEvent).detail
  const raw = typeof d === 'string' ? d : (d && typeof d === 'object' ? (d.path ?? d.route ?? '') : '')
  const target = resolveNavTarget(raw)
  if (target) { router.push(target); close() }
}
function onElClose() { close() }
function onElResult(e: Event) {
  const d = (e as CustomEvent).detail
  const target = resolveNavTarget(d && typeof d === 'object' ? (d.path ?? d.route) : undefined)
  if (target) { router.push(target); close() }
}

function teardownEl() {
  if (activeEl) {
    activeEl.removeEventListener('navigate', onElNavigate)
    activeEl.removeEventListener('close', onElClose)
    activeEl.removeEventListener('result', onElResult)
    activeEl = null
  }
  if (hostRef.value) hostRef.value.replaceChildren()
}

async function mountActive() {
  const cmd = active.value
  const tag = cmd ? str(cmd.component_tag) : ''
  if (!cmd || !hostRef.value || !isComponentTag(tag)) return
  teardownEl()
  try {
    await wippy.loadByTagName(tag)
    const el = document.createElement(tag)
    el.style.display = 'block'
    el.style.width = '100%'
    el.setAttribute('route', route.path)
    el.setAttribute('context', JSON.stringify({ route: route.path, scope: str(cmd.scope), command: cmd.id }))
    el.addEventListener('navigate', onElNavigate)
    el.addEventListener('close', onElClose)
    el.addEventListener('result', onElResult)
    hostRef.value.replaceChildren(el)
    activeEl = el
  } catch {
    mountError.value = true
  }
}

// ── Keyboard ────────────────────────────────────────────────────────────
function onGlobalKeydown(e: KeyboardEvent) {
  // mod+K is the always-on palette toggle.
  if (matchChord(e, 'mod+k')) {
    e.preventDefault()
    open.value ? close() : openPalette()
    return
  }
  // A command's own hotkey opens the palette straight into that action.
  for (const c of commands.value) {
    const hk = str(c.hotkey)
    if (hk && matchChord(e, hk)) {
      e.preventDefault()
      invoke(c)
      return
    }
  }
}

function onPanelKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault()
    active.value ? back() : close()
    return
  }
  if (active.value) return
  if (e.key === 'ArrowDown') { e.preventDefault(); selected.value = Math.min(selected.value + 1, filtered.value.length - 1) }
  else if (e.key === 'ArrowUp') { e.preventDefault(); selected.value = Math.max(selected.value - 1, 0) }
  else if (e.key === 'Enter') { e.preventDefault(); invoke(filtered.value[selected.value]) }
}

watch(filtered, () => { selected.value = 0 })

onMounted(() => {
  load(['ui.command'])
  window.addEventListener('keydown', onGlobalKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onGlobalKeydown)
  teardownEl()
})

defineExpose({ openPalette, close })
</script>

<template>
  <Transition name="cp-fade">
    <div v-if="open" class="cp-mask" @click.self="close" @keydown="onPanelKeydown">
      <div class="cp-panel" :class="{ 'cp-panel-wide': !!active }" role="dialog" aria-modal="true" aria-label="Command palette">
        <!-- List view: search + registry commands -->
        <template v-if="!active">
          <div class="cp-search">
            <Icon icon="tabler:search" class="cp-search-ico" aria-hidden="true" />
            <input
              ref="searchRef"
              v-model="query"
              class="cp-search-input"
              type="text"
              placeholder="Search commands…"
              aria-label="Search commands"
            />
            <kbd class="cp-esc">Esc</kbd>
          </div>

          <div v-if="!filtered.length" class="cp-empty">
            <Icon icon="tabler:command" aria-hidden="true" />
            <span>{{ commands.length ? 'No commands match' : 'No commands available' }}</span>
          </div>

          <ul v-else class="cp-list" role="listbox">
            <li
              v-for="(c, i) in filtered"
              :key="c.id"
              class="cp-item"
              :class="{ 'cp-item-sel': i === selected }"
              role="option"
              :aria-selected="i === selected"
              @click="invoke(c)"
              @mousemove="selected = i"
            >
              <span class="cp-item-ico"><Icon :icon="str(c.icon) || 'tabler:command'" aria-hidden="true" /></span>
              <span class="cp-item-text">
                <span class="cp-item-label">{{ c.label }}</span>
                <span v-if="c.description" class="cp-item-desc">{{ c.description }}</span>
              </span>
              <span v-if="str(c.hotkey)" class="cp-keys">
                <kbd v-for="(k, ki) in prettyChord(str(c.hotkey))" :key="ki">{{ k }}</kbd>
              </span>
            </li>
          </ul>
        </template>

        <!-- Action view: the command's mounted web component -->
        <template v-else>
          <header class="cp-head">
            <button class="cp-back" aria-label="Back to commands" @click="back">
              <Icon icon="tabler:arrow-left" aria-hidden="true" />
            </button>
            <span class="cp-head-ico"><Icon :icon="str(active.icon) || 'tabler:command'" aria-hidden="true" /></span>
            <span class="cp-head-title">{{ active.label }}</span>
            <button class="cp-close" aria-label="Close" @click="close"><Icon icon="tabler:x" aria-hidden="true" /></button>
          </header>
          <div v-if="mountError" class="cp-empty">
            <Icon icon="tabler:plug-off" aria-hidden="true" />
            <span>This action's component is not available in this build.</span>
          </div>
          <div v-show="!mountError" ref="hostRef" class="cp-host"></div>
        </template>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.cp-mask {
  position: fixed; inset: 0; z-index: 2000; display: flex; justify-content: center; align-items: flex-start;
  padding: 12vh 16px 16px; background: color-mix(in srgb, var(--p-text-color) 45%, transparent);
}
.cp-panel {
  width: min(640px, 100%); max-height: 70vh; display: flex; flex-direction: column; overflow: hidden;
  background: var(--p-content-background); color: var(--p-text-color);
  border: 1px solid var(--p-content-border-color); border-radius: 14px;
  box-shadow: 0 30px 80px -20px rgba(0, 0, 0, .5);
}
.cp-panel-wide { width: min(900px, 100%); max-height: 80vh; }

.cp-search { display: flex; align-items: center; gap: 10px; padding: 14px 16px; border-bottom: 1px solid var(--p-content-border-color); }
.cp-search-ico { width: 18px; height: 18px; color: var(--p-text-muted-color); flex: none; }
.cp-search-input { flex: 1; min-width: 0; border: 0; background: transparent; font: inherit; font-size: 15px; color: var(--p-text-color); outline: none; }
.cp-search-input::placeholder { color: var(--p-text-muted-color); }

.cp-list { list-style: none; margin: 0; padding: 6px; overflow-y: auto; }
.cp-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: var(--kx-radius-8); cursor: pointer; }
.cp-item-sel { background: color-mix(in srgb, var(--p-primary-color) 12%, transparent); }
.cp-item-ico { width: 34px; height: 34px; flex: none; display: flex; align-items: center; justify-content: center; border-radius: var(--kx-radius-8);
  background: color-mix(in srgb, var(--p-primary-color) 12%, transparent); color: var(--p-primary-color); }
.cp-item-ico svg { width: 18px; height: 18px; }
.cp-item-text { min-width: 0; flex: 1; display: flex; flex-direction: column; }
.cp-item-label { font-size: 14px; font-weight: 600; color: var(--p-text-color); }
.cp-item-desc { font-size: 12px; color: var(--p-text-muted-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cp-keys { display: flex; gap: 4px; flex: none; }

kbd {
  font: inherit; font-size: 11px; line-height: 1; padding: 3px 6px; border-radius: 6px;
  border: 1px solid var(--p-content-border-color); background: color-mix(in srgb, var(--p-text-color) 5%, transparent);
  color: var(--p-text-muted-color);
}
.cp-esc { flex: none; }

.cp-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 40px 16px; color: var(--p-text-muted-color); font-size: 13px; }
.cp-empty svg { width: 26px; height: 26px; opacity: .7; }

.cp-head { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-bottom: 1px solid var(--p-content-border-color); flex: none; }
.cp-back, .cp-close {
  width: 30px; height: 30px; flex: none; display: inline-flex; align-items: center; justify-content: center;
  border: 1px solid transparent; border-radius: 8px; background: transparent; color: var(--p-text-muted-color); cursor: pointer;
}
.cp-back:hover, .cp-close:hover { color: var(--p-text-color); background: color-mix(in srgb, var(--p-text-color) 8%, transparent); }
.cp-back svg, .cp-close svg { width: 16px; height: 16px; }
.cp-head-ico { width: 20px; height: 20px; color: var(--p-primary-color); flex: none; }
.cp-head-title { font-size: 14px; font-weight: 700; flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cp-close { margin-left: auto; }
.cp-host { flex: 1; min-height: 0; overflow: auto; }

.cp-fade-enter-active, .cp-fade-leave-active { transition: opacity .14s; }
.cp-fade-enter-from, .cp-fade-leave-to { opacity: 0; }
</style>

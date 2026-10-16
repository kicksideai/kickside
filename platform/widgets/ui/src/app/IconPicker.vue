<script setup lang="ts">
import { ref, watch, nextTick, onBeforeUnmount, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useComponentProps, useComponentEvents } from '../constants.ts'
import AnchoredPanel from './AnchoredPanel.vue'

// Shared Tabler icon picker: a trigger showing the current glyph, opening a
// searchable popover. Default view shows common icons; typing queries the
// Iconify search API (the same source @iconify/vue renders from), scoped to the
// tabler set. The popover renders inside the shadow root (so its styles apply)
// and is fixed-positioned via place(), so surrounding scroll/overflow containers
// never clip it — it is not teleported to <body> (that would leave the shadow
// root and lose styling). Selection is reported via the `select` event.
const props = useComponentProps()
const emit = useComponentEvents()

const COMMON = [
  'tabler:home', 'tabler:layout-dashboard', 'tabler:inbox', 'tabler:bell', 'tabler:robot',
  'tabler:bolt', 'tabler:bulb', 'tabler:files', 'tabler:folder', 'tabler:books',
  'tabler:database', 'tabler:plug', 'tabler:settings', 'tabler:adjustments', 'tabler:users',
  'tabler:user', 'tabler:message-circle', 'tabler:messages', 'tabler:search', 'tabler:chart-bar',
  'tabler:chart-line', 'tabler:calendar', 'tabler:clock', 'tabler:star', 'tabler:heart',
  'tabler:flag', 'tabler:tag', 'tabler:bookmark', 'tabler:rocket', 'tabler:flask',
  'tabler:brain', 'tabler:cloud', 'tabler:world', 'tabler:link', 'tabler:mail',
  'tabler:device-laptop', 'tabler:terminal', 'tabler:code', 'tabler:package', 'tabler:packages',
  'tabler:shield', 'tabler:lock', 'tabler:key', 'tabler:eye', 'tabler:list',
  'tabler:layout-list', 'tabler:apps', 'tabler:grid-dots', 'tabler:check', 'tabler:circle',
]

const open = ref(false)
const query = ref('')
const results = ref<string[]>([])
const loading = ref(false)
const trigger = ref<HTMLElement | null>(null)
const searchEl = ref<HTMLInputElement | null>(null)

// useProps() returns a ref whose .value is the props object, so the bound props
// are props.value.<name>.
const current = computed(() => { const v = props.value?.value; return typeof v === 'string' ? v : '' })
const fallback = computed(() => { const f = props.value?.fallback; return typeof f === 'string' ? f : '' })
const shown = () => (query.value.trim() ? results.value : COMMON)

let timer: ReturnType<typeof setTimeout> | undefined
watch(query, (q) => {
  if (timer) clearTimeout(timer)
  const s = q.trim()
  if (!s) { results.value = []; loading.value = false; return }
  loading.value = true
  timer = setTimeout(async () => {
    try {
      const r = await fetch(`https://api.iconify.design/search?query=${encodeURIComponent(s)}&prefix=tabler&limit=120`)
      const d = await r.json()
      results.value = Array.isArray(d.icons) ? d.icons : []
    } catch {
      results.value = []
    } finally {
      loading.value = false
    }
  }, 220)
})

// Placement, outside-click and Escape are owned by AnchoredPanel.
function toggle() {
  if (open.value) { open.value = false; return }
  open.value = true
  nextTick(() => searchEl.value?.focus())
}
function pick(name: string) { emit('select', name); open.value = false }
function reset() { emit('select', ''); open.value = false }

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})
</script>

<template>
  <!-- Single root: WippyVueElement mounts one root node. The trigger and the
       fixed popover live inside a display:contents wrapper so the layout is
       unchanged but the component still has exactly one root. -->
  <div class="ip-root">
    <button
      ref="trigger"
      type="button"
      class="ip-trigger"
      :class="open && 'ip-on'"
      title="Choose icon"
      aria-label="Choose icon"
      @click.stop="toggle"
    >
      <Icon :icon="current || fallback || 'tabler:mood-smile'" aria-hidden="true" />
      <Icon icon="tabler:chevron-down" class="ip-caret" aria-hidden="true" />
    </button>

    <AnchoredPanel v-model:open="open" :anchor="trigger" :width="304" :max-height="360" :gap="6">
      <div class="ip-pop" @click.stop>
        <div class="ip-search">
          <Icon icon="tabler:search" aria-hidden="true" />
          <input ref="searchEl" v-model="query" placeholder="Search Tabler icons…" spellcheck="false" />
          <button v-if="current" type="button" class="ip-reset" @click="reset">Reset</button>
        </div>
        <div v-if="loading" class="ip-state"><Icon icon="tabler:loader-2" class="spin" aria-hidden="true" /> Searching…</div>
        <div v-else-if="query.trim() && !results.length" class="ip-state">No icons for “{{ query }}”.</div>
        <div v-else class="ip-grid">
          <button
            v-for="name in shown()"
            :key="name"
            type="button"
            class="ip-cell"
            :class="name === current && 'ip-cell-on'"
            :title="name.replace('tabler:', '')"
            :aria-label="name.replace('tabler:', '')"
            @click="pick(name)"
          ><Icon :icon="name" aria-hidden="true" /></button>
        </div>
      </div>
    </AnchoredPanel>
  </div>
</template>

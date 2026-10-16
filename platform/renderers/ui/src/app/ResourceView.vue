<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Icon } from '@iconify/vue'
import { api, loadByTagName } from '@wippy-fe/proxy'
import { useProps } from '@wippy-fe/webcomponent-vue'

// Registry-driven content host. The set of viewers is discovered at runtime from
// kickside.renderer registry descriptors (GET /api/v1/renderers): each
// declares the content-types it claims, its tag, and a priority. A new viewer is
// added purely by registering a descriptor + shipping its bundle — no change here.
const props = useProps<{ contentType?: string; source?: string; sourceUrl?: string; alt?: string; filename?: string }>()

interface Renderer { tag: string; types: string[]; priority: number; label?: string }

// Built-in fallback so the host still works if the registry call fails (e.g.
// offline/booting): markdown handles prose, plain text, and unknown text.
const FALLBACK: Renderer[] = [
  { tag: 'wc-render-pdf', types: ['application/pdf'], priority: 90 },
  { tag: 'wc-render-image', types: ['image/*'], priority: 90 },
  { tag: 'wc-render-markdown', types: ['text/markdown', 'text/x-markdown', 'application/markdown', 'text/plain', ''], priority: 40 },
]

let registryPromise: Promise<Renderer[]> | null = null
async function getRenderers(): Promise<Renderer[]> {
  if (!registryPromise) {
    registryPromise = api.get('/api/v1/renderers')
      .then((r: any) => {
        const list = (r?.data?.renderers || []) as Array<{ tag_name?: string; content_types?: string[]; priority?: number; label?: string }>
        const mapped = list
          .filter((x) => x.tag_name && Array.isArray(x.content_types))
          .map((x) => ({ tag: x.tag_name as string, types: x.content_types as string[], priority: Number(x.priority) || 0, label: x.label }))
        return mapped.length ? mapped : FALLBACK
      })
      .catch(() => FALLBACK)
  }
  return registryPromise as Promise<Renderer[]>
}

// Match precedence: exact type > `type/*` prefix > `*/*` wildcard, then highest
// priority wins within the same specificity.
function score(rendererTypes: string[], ct: string): number {
  let best = -1
  for (const raw of rendererTypes) {
    const pat = (raw || '').toLowerCase().trim()
    if (pat === ct) best = Math.max(best, 3)
    else if (pat.endsWith('/*') && ct.startsWith(pat.slice(0, -1))) best = Math.max(best, 2)
    else if (pat === '*/*') best = Math.max(best, 1)
    else if (pat === '' && ct === '') best = Math.max(best, 3)
  }
  return best
}

async function pick(ct: string): Promise<Renderer | null> {
  const t = (ct || '').toLowerCase().split(';')[0].trim()
  const renderers = await getRenderers()
  let chosen: Renderer | null = null
  let chosenScore = 0
  for (const r of renderers) {
    const s = score(r.types, t)
    if (s <= 0) continue
    if (s > chosenScore || (s === chosenScore && (!chosen || r.priority > chosen.priority))) {
      chosen = r; chosenScore = s
    }
  }
  if (!chosen && (t === '' || t.startsWith('text/'))) {
    chosen = renderers.find((r) => r.tag === 'wc-render-markdown') || null
  }
  return chosen
}

const host = ref<HTMLElement | null>(null)
const unknown = ref(false)
let el: HTMLElement | null = null
let token = 0

// Every viewer accepts a subset of these; setting all is harmless (unknown
// attributes are ignored) and keeps the host fully generic.
function applyAttrs(node: HTMLElement) {
  const p = props.value
  if (p?.source) node.setAttribute('source', p.source)
  if (p?.sourceUrl) node.setAttribute('source-url', p.sourceUrl)
  if (p?.contentType) node.setAttribute('content-type', p.contentType)
  if (p?.alt) node.setAttribute('alt', p.alt)
  if (p?.filename) node.setAttribute('filename', p.filename)
}

async function mount() {
  const my = ++token
  unknown.value = false
  if (el) { el.remove(); el = null }
  if (!host.value) return
  const rule = await pick(props.value?.contentType || '')
  if (my !== token || !host.value) return
  if (!rule) { unknown.value = true; return }
  try { if (!customElements.get(rule.tag)) await loadByTagName(rule.tag, { timeoutMs: 10000 }) } catch { /* inert if undefined */ }
  if (my !== token || !host.value) return
  el = document.createElement(rule.tag)
  applyAttrs(el)
  el.style.display = 'block'
  host.value.appendChild(el)
}

onMounted(mount)
watch(() => [props.value?.contentType, props.value?.source, props.value?.sourceUrl], mount)
onBeforeUnmount(() => { if (el) el.remove() })
</script>

<template>
  <div class="rv">
    <div v-if="unknown" class="rv-fallback">
      <Icon icon="tabler:file-unknown" aria-hidden="true" />
      <span>No inline viewer for <strong>{{ props?.contentType || 'this type' }}</strong>.</span>
      <a v-if="props?.sourceUrl" :href="props.sourceUrl" target="_blank" rel="noopener noreferrer">Open ↗</a>
    </div>
    <div v-show="!unknown" ref="host" />
  </div>
</template>

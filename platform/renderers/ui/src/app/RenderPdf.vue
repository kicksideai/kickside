<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { api } from '@wippy-fe/proxy'
import { useProps } from '@wippy-fe/webcomponent-vue'

// Renders each PDF page to a canvas and overlays a transparent, selectable text
// layer. The shell embeds module surfaces in a sandboxed iframe that blocks the
// browser's native PDF plugin, so the document is drawn in-page with pdf.js; the
// text layer keeps the content selectable and searchable. The worker is bundled
// (no CDN) so it runs inside Shadow DOM / iframe deployments.
const props = useProps<{ sourceUrl?: string }>()

// pdf.js (~5 MB incl. worker) is loaded lazily on first render so it doesn't
// weigh down every page that merely registers this element. Cached after first use.
let pdfjsLib: typeof import('pdfjs-dist') | null = null
async function loadPdfjs() {
  if (pdfjsLib) return pdfjsLib
  const [lib, worker] = await Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/build/pdf.worker.mjs?url') as Promise<{ default: string }>,
  ])
  lib.GlobalWorkerOptions.workerSrc = worker.default
  pdfjsLib = lib
  return lib
}

// Bound the in-memory PDF and rendered page count so a huge document can't pin
// the tab.
const MAX_PDF_BYTES = 50 * 1024 * 1024
const MAX_PDF_PAGES = 300
const SCALE = 1.3

const holder = ref<HTMLElement | null>(null)
const loading = ref(false)
const error = ref('')
const pages = ref<number[]>([])
let runId = 0
let pdfDoc: { destroy?: () => Promise<void> | void; numPages?: number; getPage?: any } | null = null

async function cleanup() {
  const doc = pdfDoc
  pdfDoc = null
  if (doc?.destroy) await doc.destroy()
}

async function renderPdf() {
  const url = props.value?.sourceUrl
  runId += 1
  const current = runId
  pages.value = []
  error.value = ''
  if (!url) return
  loading.value = true
  try {
    const pdfjs = await loadPdfjs()
    await cleanup()
    const { data } = await api.get(url, { responseType: 'arraybuffer' })
    if (current !== runId) return
    const bytes = (data as ArrayBuffer)?.byteLength ?? 0
    if (bytes > MAX_PDF_BYTES) {
      error.value = `PDF is too large to preview (${(bytes / 1048576).toFixed(0)} MB; limit ${MAX_PDF_BYTES / 1048576} MB).`
      return
    }
    const doc = await pdfjs.getDocument({ data: new Uint8Array(data) }).promise
    pdfDoc = doc
    const total = Math.min(doc.numPages, MAX_PDF_PAGES)
    pages.value = Array.from({ length: total }, (_v, i) => i + 1)
    await nextTick()
    const wraps = holder.value?.querySelectorAll<HTMLElement>('.pdfv-page[data-page]') || []
    // Fit each page to the available box width so a wide/scanned page never overflows
    // and scrolls horizontally; clamp so tiny pages don't upscale to a blur. Measure
    // the .pdfv scroll viewport (the parent) — .pdfv-pages itself shrink-wraps its
    // canvas content, so its own width would just echo the rendered page.
    const box = holder.value?.parentElement || holder.value
    const containerW = (box?.clientWidth || 0) - 2
    for (const wrap of wraps) {
      if (current !== runId) return
      const pageNo = Number(wrap.dataset.page || 0)
      const page = await doc.getPage(pageNo)
      const base = page.getViewport({ scale: 1 })
      const scale = containerW > 0 ? Math.max(0.4, Math.min(2, containerW / base.width)) : SCALE
      const viewport = page.getViewport({ scale })
      const w = Math.floor(viewport.width)
      const h = Math.floor(viewport.height)

      const canvas = wrap.querySelector('canvas')
      const context = canvas?.getContext('2d')
      if (!canvas || !context) continue
      canvas.width = w
      canvas.height = h
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      await page.render({ canvas, canvasContext: context, viewport }).promise

      const textDiv = wrap.querySelector<HTMLElement>('.textLayer')
      if (textDiv) {
        textDiv.replaceChildren()
        textDiv.style.width = `${w}px`
        textDiv.style.height = `${h}px`
        textDiv.style.setProperty('--scale-factor', String(scale))
        const layer = new pdfjs.TextLayer({
          textContentSource: page.streamTextContent(),
          container: textDiv,
          viewport,
        })
        await layer.render()
      }
    }
  } catch (e: any) {
    error.value = e?.response?.data?.error || e?.message || 'could not load PDF'
  } finally {
    if (current === runId) loading.value = false
  }
}

watch(() => props.value?.sourceUrl, () => { void renderPdf() }, { immediate: true })
onBeforeUnmount(() => { runId += 1; void cleanup() })
</script>

<template>
  <div class="pdfv">
    <div v-if="loading" class="rv-state"><Icon icon="tabler:loader-2" class="spin" aria-hidden="true" /><span>Loading PDF…</span></div>
    <div v-if="error" class="rv-state err"><Icon icon="tabler:alert-circle" aria-hidden="true" /><span>{{ error }}</span></div>
    <div ref="holder" class="pdfv-pages">
      <div v-for="p in pages" :key="p" class="pdfv-page" :data-page="p">
        <canvas />
        <div class="textLayer" />
      </div>
    </div>
  </div>
</template>

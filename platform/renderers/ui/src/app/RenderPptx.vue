<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import { api } from '@wippy-fe/proxy'
import { useProps } from '@wippy-fe/webcomponent-vue'

// PowerPoint viewer: fetches the deck bytes through the authed proxy, converts
// each slide to a fixed 960x540 HTML block (@jvmr/pptx-to-html), and scales that
// block to the available width so it fits whatever box the host gives us.
const props = useProps<{ sourceUrl?: string }>()

const SLIDE_W = 960
const SLIDE_H = 540

const loading = ref(false)
const error = ref('')
const slides = ref<string[]>([])
const current = ref(0)
const frame = ref<HTMLElement | null>(null)
const scale = ref(1)

let ro: ResizeObserver | null = null
function fit() {
  const w = frame.value?.clientWidth
  if (w && w > 0) scale.value = w / SLIDE_W
}

async function load() {
  error.value = ''
  slides.value = []
  current.value = 0
  const url = props.value?.sourceUrl
  if (!url) return
  loading.value = true
  try {
    const { data } = await api.get(url, { responseType: 'arraybuffer' })
    const { pptxToHtml } = await import('@jvmr/pptx-to-html')
    slides.value = await pptxToHtml(data as ArrayBuffer, { width: SLIDE_W, height: SLIDE_H, scaleToFit: true })
    await nextTick()
    fit()
  } catch (e: any) {
    error.value = e?.response?.data?.error || e?.message || 'could not render presentation'
  } finally {
    loading.value = false
  }
}

function prev() { if (current.value > 0) current.value-- }
function next() { if (current.value < slides.value.length - 1) current.value++ }

onMounted(() => {
  ro = new ResizeObserver(fit)
  if (frame.value) ro.observe(frame.value)
})
watch(() => props.value?.sourceUrl, load, { immediate: true })
watch(frame, (el) => { if (el && ro) { ro.observe(el); fit() } })
onBeforeUnmount(() => { ro?.disconnect(); ro = null; slides.value = [] })
</script>

<template>
  <div class="pptxv">
    <div v-if="loading" class="rv-state"><Icon icon="tabler:loader-2" class="spin" aria-hidden="true" /><span>Rendering slides…</span></div>
    <div v-else-if="error" class="rv-state err"><Icon icon="tabler:alert-circle" aria-hidden="true" /><span>{{ error }}</span></div>
    <template v-else-if="slides.length">
      <div ref="frame" class="pptxv-frame" :style="{ height: (SLIDE_H * scale) + 'px' }">
        <!-- eslint-disable-next-line vue/no-v-html -- slide HTML from pptx-to-html -->
        <div
          class="pptxv-stage"
          :style="{ width: SLIDE_W + 'px', height: SLIDE_H + 'px', transform: `scale(${scale})` }"
          v-html="slides[current]"
        />
      </div>
      <div class="pptxv-nav">
        <button class="pptxv-btn" :disabled="current === 0" aria-label="Previous slide" @click="prev"><Icon icon="tabler:chevron-left" aria-hidden="true" /></button>
        <span class="pptxv-count">{{ current + 1 }} / {{ slides.length }}</span>
        <button class="pptxv-btn" :disabled="current >= slides.length - 1" aria-label="Next slide" @click="next"><Icon icon="tabler:chevron-right" aria-hidden="true" /></button>
      </div>
    </template>
  </div>
</template>

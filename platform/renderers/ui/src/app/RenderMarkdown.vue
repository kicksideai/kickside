<script setup lang="ts">
import { ref, computed, nextTick, watch, onBeforeUnmount } from 'vue'
import { Icon } from '@iconify/vue'
import { api } from '@wippy-fe/proxy'
import { useProps } from '@wippy-fe/webcomponent-vue'
import { usePreview } from '../preview/usePreview'
import TablePager from './TablePager.vue'

const props = useProps<{ source?: string; sourceUrl?: string }>()
const preview = usePreview()
const { result, loading, error } = preview
const fetching = ref(false)
let loadSequence = 0
let diagramGeneration = 0
const body = ref<HTMLElement | null>(null)
onBeforeUnmount(() => { loadSequence++; diagramGeneration++ })
async function load() {
  const sequence = ++loadSequence
  preview.clear()
  fetching.value = false
  const inline = props.value?.source
  if (typeof inline === 'string' && inline.trim()) { preview.markdown(inline); return }
  const url = props.value?.sourceUrl
  if (!url) return
  fetching.value = true
  try {
    const { data } = await api.get(url, { responseType: 'text' })
    if (sequence !== loadSequence) return
    preview.markdown(typeof data === 'string' ? data : String(data ?? ''))
  } catch (cause: unknown) {
    if (sequence !== loadSequence) return
    error.value = cause instanceof Error ? cause.message : 'Could not load content'
  } finally {
    if (sequence === loadSequence) fetching.value = false
  }
}
watch(() => [props.value?.source, props.value?.sourceUrl], load, { immediate: true })
const html = computed(() => result.value?.kind === 'markdown' ? result.value.html : '')
async function drawDiagrams() {
  const generation = ++diagramGeneration
  await nextTick()
  if (generation !== diagramGeneration) return
  const blocks = [...(body.value?.querySelectorAll<HTMLElement>('.md-mermaid') ?? [])]
  for (const block of blocks) {
    const source = block.textContent ?? ''
    try {
      const { default: mermaid } = await import('mermaid')
      if (generation !== diagramGeneration) return
      const theme = getComputedStyle(block)
      const surface = theme.getPropertyValue('--p-content-background').trim()
      const border = theme.getPropertyValue('--p-content-border-color').trim()
      mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', htmlLabels: false, theme: 'base',
        themeVariables: {
          primaryColor: surface, secondaryColor: surface, tertiaryColor: surface,
          primaryBorderColor: border, primaryTextColor: theme.color,
          secondaryTextColor: theme.color, tertiaryTextColor: theme.color,
          textColor: theme.color, lineColor: theme.color, fontFamily: theme.fontFamily, fontSize: theme.fontSize,
        },
      })
      const { svg } = await mermaid.render(`md-mermaid-${crypto.randomUUID()}`, source)
      if (generation !== diagramGeneration) return
      block.innerHTML = svg
    } catch (cause: unknown) {
      if (generation !== diagramGeneration) return
      const note = document.createElement('div')
      note.className = 'md-mermaid-error'
      note.textContent = `Diagram could not render: ${cause instanceof Error ? cause.message : String(cause)}`
      block.appendChild(note)
    }
  }
}
watch(html, drawDiagrams, { immediate: true })
</script>
<template>
  <div>
    <div v-if="fetching || (loading && !result)" class="rv-state"><Icon icon="tabler:loader-2" class="spin" aria-hidden="true" /><span>Loading…</span></div>
    <div v-if="error" class="rv-state err"><Icon icon="tabler:alert-circle" aria-hidden="true" /><span>{{ error }}</span></div>
    <template v-if="result?.kind === 'markdown'">
      <TablePager v-for="(size, i) in result.tables" :key="i" :size="size" :page="result.pages[i]" :busy="loading" @change="preview.page(i, $event)" />
      <!-- eslint-disable-next-line vue/no-v-html -- worker renders html:false markdown then sanitizes -->
      <div ref="body" class="md markdown-body" :aria-busy="loading" v-html="result.html" />
    </template>
  </div>
</template>

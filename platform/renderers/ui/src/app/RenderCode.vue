<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import hljs from 'highlight.js'
import { api } from '@wippy-fe/proxy'
import { useProps } from '@wippy-fe/webcomponent-vue'

// Source/data viewer: syntax-highlights code, JSON, XML, YAML, etc. via
// highlight.js, and renders delimited data (CSV/TSV) as a table. Content is
// inline (source) or fetched (source-url) through the authed proxy.
const props = useProps<{ source?: string; sourceUrl?: string; contentType?: string; filename?: string }>()

const loading = ref(false)
const error = ref('')
const text = ref('')

// Map a content-type / filename to a highlight.js language hint.
const LANG_BY_MIME: Record<string, string> = {
  'application/json': 'json',
  'application/xml': 'xml',
  'text/xml': 'xml',
  'application/javascript': 'javascript',
  'text/javascript': 'javascript',
  'application/typescript': 'typescript',
  'text/css': 'css',
  'application/x-yaml': 'yaml',
  'text/yaml': 'yaml',
  'text/x-python': 'python',
  'text/x-go': 'go',
  'text/x-lua': 'lua',
  'application/x-sh': 'bash',
  'text/x-shellscript': 'bash',
  'application/sql': 'sql',
  'text/x-sql': 'sql',
}
const LANG_BY_EXT: Record<string, string> = {
  json: 'json', xml: 'xml', html: 'xml', yml: 'yaml', yaml: 'yaml',
  js: 'javascript', mjs: 'javascript', ts: 'typescript', tsx: 'typescript', jsx: 'javascript',
  css: 'css', scss: 'scss', py: 'python', go: 'go', lua: 'lua', rb: 'ruby', php: 'php',
  java: 'java', c: 'c', h: 'c', cpp: 'cpp', cs: 'csharp', rs: 'rust', sh: 'bash', bash: 'bash',
  sql: 'sql', toml: 'ini', ini: 'ini',
}

const mime = computed(() => (props.value?.contentType || '').toLowerCase().split(';')[0].trim())
const ext = computed(() => (props.value?.filename || '').split('.').pop()?.toLowerCase() || '')
const isTable = computed(() => mime.value === 'text/csv' || mime.value === 'text/tab-separated-values' || ext.value === 'csv' || ext.value === 'tsv')

function langHint(): string {
  return LANG_BY_MIME[mime.value] || LANG_BY_EXT[ext.value] || ''
}

const highlighted = computed(() => {
  const src = text.value
  if (!src) return ''
  const lang = langHint()
  try {
    if (lang && hljs.getLanguage(lang)) return hljs.highlight(src, { language: lang, ignoreIllegals: true }).value
    return hljs.highlightAuto(src).value
  } catch {
    const div = document.createElement('div'); div.textContent = src; return div.innerHTML
  }
})

// Gutter line numbers, sized to the line count (capped so a huge file does not
// build a giant string).
const lineNumbers = computed(() => {
  if (isTable.value || !text.value) return ''
  const n = Math.min(text.value.split('\n').length, 50000)
  let s = ''
  for (let i = 1; i <= n; i++) s += i + '\n'
  return s
})

// Minimal RFC-4180-ish parser: handles quoted fields, escaped quotes, and the
// delimiter implied by the content-type (tab for TSV, comma otherwise).
const rows = computed<string[][]>(() => {
  if (!isTable.value || !text.value) return []
  const delim = mime.value === 'text/tab-separated-values' || ext.value === 'tsv' ? '\t' : ','
  const out: string[][] = []
  let row: string[] = [], field = '', q = false
  const s = text.value.replace(/\r\n/g, '\n')
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (q) {
      if (c === '"') { if (s[i + 1] === '"') { field += '"'; i++ } else q = false }
      else field += c
    } else if (c === '"') q = true
    else if (c === delim) { row.push(field); field = '' }
    else if (c === '\n') { row.push(field); out.push(row); row = []; field = '' }
    else field += c
  }
  if (field.length || row.length) { row.push(field); out.push(row) }
  return out.filter(r => r.length > 1 || (r[0] && r[0].length))
})

async function load() {
  error.value = ''
  const inline = props.value?.source
  if (typeof inline === 'string' && inline.length) { text.value = inline; return }
  const url = props.value?.sourceUrl
  if (!url) { text.value = ''; return }
  loading.value = true
  try {
    const { data } = await api.get(url, { responseType: 'text' })
    text.value = typeof data === 'string' ? data : String(data ?? '')
  } catch (e: any) {
    error.value = e?.response?.data?.error || e?.message || 'could not load content'
  } finally {
    loading.value = false
  }
}

watch(() => [props.value?.source, props.value?.sourceUrl, props.value?.contentType], load, { immediate: true })
</script>

<template>
  <div class="codev">
    <div v-if="loading" class="rv-state"><Icon icon="tabler:loader-2" class="spin" aria-hidden="true" /><span>Loading…</span></div>
    <div v-else-if="error" class="rv-state err"><Icon icon="tabler:alert-circle" aria-hidden="true" /><span>{{ error }}</span></div>
    <div v-else-if="isTable && rows.length" class="codev-table-wrap">
      <table class="codev-table">
        <thead><tr><th v-for="(c, i) in rows[0]" :key="i">{{ c }}</th></tr></thead>
        <tbody>
          <tr v-for="(r, ri) in rows.slice(1)" :key="ri">
            <td v-for="(c, ci) in r" :key="ci">{{ c }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="codev-code">
      <pre class="codev-gutter" aria-hidden="true">{{ lineNumbers }}</pre>
      <!-- eslint-disable-next-line vue/no-v-html -- highlight.js token markup over escaped text -->
      <pre class="hljs codev-pre"><code v-html="highlighted" /></pre>
    </div>
  </div>
</template>

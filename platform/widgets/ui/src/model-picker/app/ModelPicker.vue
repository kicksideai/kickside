<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { Icon } from '@iconify/vue'
import Select from 'primevue/select'
import { api } from '@wippy-fe/proxy'
import { useComponentProps, useComponentEvents } from '../constants.ts'

// Shared model picker: a Select showing the current model (or model class), whose
// filterable panel lists two groups — Classes (fast / balanced / …, emitted as
// "class:<name>") and individual Models (emitted as the model name). Self-feeds
// from the generic /api/v1/models endpoints, so any module reuses it by tag with no
// model data of its own. The theme's PrimeVuePlugin renders the panel inside this
// element's shadow root (never clipped by scroll containers). Selection is reported
// via the `select` event.
const props = useComponentProps()
const emit = useComponentEvents()

interface ModelRow { name: string; title: string; provider?: string }
interface ClassRow { capability: string; name: string; models: { name: string; title: string }[] }
interface OptionRow { value: string; title: string; subtitle: string; icon: string }

const loading = ref(false)
const models = ref<ModelRow[]>([])
const classes = ref<ClassRow[]>([])
let loadGeneration = 0
let mounted = false

// useProps() returns a ref whose .value is the props object, so the bound props
// are props.value.<name> (the value prop is literally named "value"). Reading the
// flat container instead left every value empty and crashed isClass on a non-string.
const capability = computed(() => props.value?.capability || 'generate')
// Classes-only mode: settings that must stay portable across deployments pick a
// class (resolved to the highest-priority card at run time), never a name.
const classesOnly = computed(() => props.value?.mode === 'classes')
const current = computed(() => { const v = props.value?.value; return typeof v === 'string' ? v : '' })
function isClass(v: unknown): boolean { return typeof v === 'string' && v.startsWith('class:') }
function titleCase(s: string): string { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s }

const currentLabel = computed(() => {
  const v = current.value
  if (!v) return 'Default model'
  if (isClass(v)) return titleCase(v.slice(6))
  return models.value.find(m => m.name === v)?.title || v
})
const currentIcon = computed(() => isClass(current.value) ? 'tabler:category' : 'tabler:cpu')

// Two groups fed to Select: Classes (value "class:<name>") then Models (value =
// model name). Only non-empty groups are emitted so no bare header shows.
const options = computed<{ group: string; items: OptionRow[] }[]>(() => {
  const out: { group: string; items: OptionRow[] }[] = []
  const available = new Set(models.value.map(m => m.name))
  // A class resolves to its first ranked member. Only offer it for a capability
  // filter when that effective model matches; a lower-ranked match is insufficient.
  const matchingClasses = capability.value === 'embed' ? [] : classes.value.filter(c =>
    c.capability === capability.value || (c.models[0] && available.has(c.models[0].name)))
  if (matchingClasses.length) {
    out.push({
      group: 'Classes',
      items: matchingClasses.map(c => ({
        value: `class:${c.name}`,
        title: titleCase(c.name),
        subtitle: `${c.models.length} model${c.models.length === 1 ? '' : 's'}${c.models[0] ? ` · ${c.models[0].title}` : ''}`,
        icon: 'tabler:category',
      })),
    })
  }
  if (models.value.length && !classesOnly.value) {
    out.push({
      group: 'Models',
      items: models.value.map(m => ({ value: m.name, title: m.title, subtitle: m.provider || '', icon: 'tabler:cpu' })),
    })
  }
  return out
})

async function loadData() {
  const generation = ++loadGeneration
  const requestedCapability = capability.value
  loading.value = true
  try {
    const [ml, cl] = await Promise.all([
      api.get(`/api/v1/models/list?capability=${encodeURIComponent(requestedCapability)}`),
      // Embedding selection remains model-only. Classes enrich the other
      // pickers; their availability must not hide a successful model list.
      requestedCapability === 'embed'
        ? Promise.resolve(null)
        : api.get('/api/v1/models/classes').catch(() => null),
    ])
    if (generation !== loadGeneration || requestedCapability !== capability.value) return
    models.value = ml?.data?.success ? (ml.data.models || []) : []
    classes.value = cl?.data?.success ? (cl.data.classes || []) : []
  } catch {
    if (generation === loadGeneration && requestedCapability === capability.value) {
      models.value = []
      classes.value = []
    }
  } finally {
    if (generation === loadGeneration) loading.value = false
  }
}

watch(capability, () => {
  loadGeneration += 1
  models.value = []
  classes.value = []
  loading.value = false
  if (mounted) void loadData()
})
onMounted(() => {
  mounted = true
  void loadData()
})
onBeforeUnmount(() => {
  mounted = false
  loadGeneration += 1
})
</script>

<template>
  <Select
    class="mp-select"
    :model-value="current"
    :options="options"
    option-group-label="group"
    option-group-children="items"
    option-label="title"
    option-value="value"
    :filter-fields="['title', 'subtitle', 'value']"
    filter
    checkmark
    :filter-placeholder="classesOnly ? 'Search classes…' : 'Search models…'"
    placeholder="Default model"
    :loading="loading"
    aria-label="Choose model"
    @before-show="loadData"
    @update:model-value="(v: unknown) => emit('select', (v as string) ?? '')"
  >
    <template #value>
      <span class="mp-val">
        <Icon :icon="currentIcon" class="mp-val-ico" aria-hidden="true" />
        <span class="mp-val-label" :class="!current && 'mp-muted'">{{ currentLabel }}</span>
      </span>
    </template>
    <template #option="{ option }">
      <span class="mp-opt">
        <Icon :icon="option.icon" class="mp-opt-ico" aria-hidden="true" />
        <span class="mp-opt-body">
          <span class="mp-opt-title">{{ option.title }}</span>
          <span v-if="option.subtitle" class="mp-opt-sub">{{ option.subtitle }}</span>
        </span>
      </span>
    </template>
    <template #empty>
      <span class="mp-empty">
        <template v-if="loading"><Icon icon="tabler:loader-2" class="spin" aria-hidden="true" /> Loading…</template>
        <template v-else>No models…</template>
      </span>
    </template>
    <template #emptyfilter>
      <span class="mp-empty">No models…</span>
    </template>
  </Select>
</template>

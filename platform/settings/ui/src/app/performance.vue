<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import SettingsToolbar from './SettingsToolbar.vue'
import { api, on } from '@wippy-fe/proxy'
import { useHostVisibilityRefresh } from '@wippy-fe/webcomponent-vue'
import { boundsLabel, controls, displayValue, equal, groups, inputId, storedValue, tiers, tierTitle, validate, type Control, type Field } from './performance-fields'

interface Pool { database?: string; online: boolean; total: number; busy: number; idle: number; awaited: number; applied_revision: number; apply_error?: { message: string }; queued: Record<string, number>; running: Record<string, number> }
const fields = ref<Record<string, Field>>({})
const draft = ref<Record<string, any>>({})
const resets = ref(new Set<string>())
const pool = ref<Pool | null>(null)
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const loadError = ref('')
const baseline = ref(false)
const saved = ref(false)
const committedRevision = ref(-1)
const pendingApply = computed(() => baseline.value && (pool.value?.applied_revision ?? -1) < committedRevision.value)
let inflight: Promise<void> | null = null
let pending = false
let generation = 0
let disposed = false
const clone = (value: any) => value === undefined ? value : JSON.parse(JSON.stringify(value))
const controlOf = (key: string) => controls.find(control => control.key === key)!
const seedValue = (key: string, value: unknown) => clone(displayValue(controlOf(key), value))
const isDirty = (key: string) => baseline.value && (resets.value.has(key) || !equal(storedValue(controlOf(key), draft.value[key]), fields.value[key]?.value))
const unused = (key: string) => !!pool.value?.database && key.startsWith('worker.count_') && key !== `worker.count_${pool.value.database}`
const orderedGroups = computed(() => groups.map(group => {
  if (group.title !== 'Workers') return group
  const counts = group.fields.filter(control => control.key.startsWith('worker.count_'))
  counts.sort((a, b) => Number(unused(a.key)) - Number(unused(b.key)))
  return { ...group, fields: [...counts, ...group.fields.filter(control => !control.key.startsWith('worker.count_'))] }
}))
const dirty = computed(() => controls.some(control => isDirty(control.key)))
const invalid = computed(() => loading.value ? {} : validate(draft.value))
const source = (key: string) => resets.value.has(key) ? 'Reset on save' : ({ default: 'Default', host: 'Host', admin: 'Admin' }[fields.value[key]?.source] || '')
const totalShares = computed(() => tiers.reduce((sum, tier) => sum + Math.max(0, Number(draft.value['fairness.shares']?.[tier]) || 0), 0))
const percent = (tier: string) => Math.max(0, Number(draft.value['fairness.shares']?.[tier]) || 0) / Math.max(1, totalShares.value) * 100
const barLabel = computed(() => tiers.map(tier => `${tierTitle(tier)} ${Math.round(percent(tier))}%`).join(', '))

function responseData(cause: unknown): any {
  return (cause as { response?: { data?: unknown } })?.response?.data
}
function failureMessage(cause: unknown): string {
  const data = responseData(cause)
  const message = data?.error || data?.message || (cause instanceof Error ? cause.message : String(cause))
  return data?.committed ? `Settings are saved; owner notification failed: ${message}` : message
}
function install(next: Record<string, Field>, preserve: boolean, nextRevision?: number) {
  if (typeof nextRevision === 'number' && nextRevision < committedRevision.value) return
  if (typeof nextRevision === 'number') committedRevision.value = nextRevision
  for (const control of controls) {
    const key = control.key
    if (!preserve || !isDirty(key)) draft.value[key] = seedValue(key, next[key].value)
    if (preserve && resets.value.has(key)) draft.value[key] = seedValue(key, next[key].fallback)
  }
  fields.value = next
  baseline.value = true
}
function validFields(next: any): next is Record<string, Field> {
  return !!next && controls.every(control => next[control.key])
}
function load(): Promise<void> {
  if (inflight) { pending = true; return inflight }
  inflight = (async () => {
    do {
      pending = false
      try {
        const requestedGeneration = generation
        const { data } = await api.get('/api/v1/settings/performance')
        if (disposed) return
        if (generation !== requestedGeneration) { pending = true; continue }
        if (!data?.success || !validFields(data.fields) || !data.pool) throw new Error(data?.error || 'Could not load performance settings.')
        install(data.fields, true, data.revision)
        pool.value = data.pool
        if (!pendingApply.value) error.value = ''
        loadError.value = ''
      } catch (cause) {
        if (!disposed) {
          loadError.value = failureMessage(cause)
        }
      } finally { if (!disposed) loading.value = false }
    } while (pending && !disposed)
  })().finally(() => { inflight = null })
  return inflight
}
const describedBy = (key: string) => [inputId(key) + '-help', inputId(key) + '-bounds', invalid.value[key] ? inputId(key) + '-error' : ''].filter(Boolean).join(' ')
function edit(control: Control, event: Event) {
  resets.value.delete(control.key)
  const value = (event.target as HTMLInputElement).value
  draft.value[control.key] = (control.min === undefined || control.durationMilliseconds) ? value : value === '' ? null : Number(value)
  saved.value = false
}
function editShare(tier: string, event: Event) {
  resets.value.delete('fairness.shares')
  const value = (event.target as HTMLInputElement).value
  draft.value['fairness.shares'][tier] = value === '' ? null : Number(value)
  saved.value = false
}
function reset(key: string) {
  draft.value[key] = seedValue(key, fields.value[key].fallback)
  resets.value.add(key)
  saved.value = false
}
function discard() {
  if (!baseline.value) return
  for (const control of controls) draft.value[control.key] = seedValue(control.key, fields.value[control.key].value)
  resets.value.clear()
  saved.value = false
}
async function save() {
  if (!baseline.value || saving.value || Object.keys(invalid.value).length || !dirty.value) return
  saving.value = true
  error.value = ''
  const values: Record<string, unknown> = {}
  for (const control of controls) if (isDirty(control.key) && !resets.value.has(control.key)) values[control.key] = clone(storedValue(control, draft.value[control.key]))
  try {
    const { data } = await api.put('/api/v1/settings/performance', { values, unset: [...resets.value] })
    if (disposed) return
    if (!data?.success) throw { response: { data } }
    if (!validFields(data.fields)) throw new Error('The save response has no policy fields.')
    resets.value.clear()
    generation++
    install(data.fields, false, data.revision)
    saved.value = true
  } catch (cause) {
    if (!disposed) {
      const data = responseData(cause)
      if (data?.committed && validFields(data.fields)) {
        resets.value.clear()
        generation++
        install(data.fields, false, data.revision)
      }
      error.value = failureMessage(cause)
      saved.value = false
    }
  } finally { if (!disposed) saving.value = false }
}
const unsubscribe = on('kickside.jobs.performance.changed', () => { void load() })
const unsubscribePolicy = on('kickside.jobs.policy.changed', () => { void load() })
useHostVisibilityRefresh(load)
onUnmounted(() => { disposed = true; pending = false; unsubscribe(); unsubscribePolicy() })
</script>

<template>
  <div class="ap perf">
    <div class="ap-body">
      <SettingsToolbar :dirty="dirty" :saving="saving" :disabled="!baseline" :invalid="!!Object.keys(invalid).length" :saved="saved" @discard="discard" @save="save" />
      <p v-if="pendingApply" class="ap-hint" role="status">Applying…</p>
      <div v-if="pool?.apply_error" class="ap-msg ap-err" role="alert">{{ pool.apply_error.message }}</div>
      <div v-if="error" class="ap-msg ap-err" role="alert">{{ error }}</div>
      <div v-if="loadError" class="ap-msg ap-err" role="alert">{{ loadError }} <Button label="Reload" text @click="load" /></div>
      <div v-if="loading" class="ap-loading" role="status">Loading performance settings…</div>
      <div v-else-if="pool" class="ap-cards">
        <section class="ap-card perf-status" aria-label="Live job pool status">
          <header class="ap-h"><Icon icon="tabler:activity" aria-hidden="true" /> Job pool
            <span v-if="pool.database" class="ks-tag kx-tag-caps">{{ pool.database === 'postgres' ? 'Postgres' : 'SQLite' }}</span>
          </header>
          <p class="ap-sub">Tune job throughput, queue fairness and execution limits.</p>
          <div class="perf-status-grid">
            <div class="perf-capacity">
              <h3 class="perf-stat-title">Slots</h3>
              <div class="perf-stat-values"><span><strong>{{ pool.busy }}</strong> busy</span><span><strong>{{ pool.idle }}</strong> idle</span></div>
            </div>
            <div v-for="tier in tiers" :key="tier" class="perf-tier">
              <h3 class="perf-stat-title">{{ tierTitle(tier) }}</h3>
              <dl class="perf-stat-values">
                <div><dt title="Includes scheduled pending jobs" aria-description="Includes scheduled pending jobs">Queued</dt><dd>{{ pool.queued[tier] || 0 }}</dd></div>
                <div><dt>Running</dt><dd>{{ pool.running[tier] || 0 }}</dd></div>
              </dl>
            </div>
          </div>
          <p class="ap-hint perf-capacity-summary">{{ pool.total }} total slots · {{ pool.awaited }} reserved for awaited work<span v-if="pool.applied_revision < 0"> · Awaiting pool startup</span></p>
        </section>
        <section v-for="group in orderedGroups" :key="group.title" class="ap-card">
          <h2 class="ap-h">{{ group.title }}</h2>
          <p class="ap-sub">{{ group.help }}</p>
          <div v-for="control in group.fields" :key="control.key" class="perf-field" :class="{ 'perf-field-unused': unused(control.key) }" :data-policy-key="control.key">
            <div class="perf-description">
              <div class="perf-field-title"><span v-if="control.key === 'fairness.shares'" :id="inputId(control.key)">{{ control.title }}</span><label v-else :for="inputId(control.key)">{{ control.title }}</label><span class="ks-tag kx-tag-caps" :data-source="fields[control.key]?.source">{{ source(control.key) }}</span></div>
              <p :id="inputId(control.key) + '-help'" class="ap-hint">{{ control.help }}</p>
              <p :id="inputId(control.key) + '-bounds'" class="perf-bounds">{{ boundsLabel(control) }}</p>
              <p v-if="unused(control.key)" class="ap-hint perf-unused-note">Not used by this installation.</p>
              <Button v-if="fields[control.key]?.source === 'admin' && !resets.has(control.key)" :aria-label="`Reset ${control.title} to default`" label="Reset to default" class="perf-reset" text severity="secondary" :disabled="saving" @click="reset(control.key)" />
              <p v-if="resets.has(control.key)" class="ap-hint">Removes the Admin override on save. Host configuration takes precedence over the Default.</p>
            </div>
            <div v-if="control.key === 'fairness.shares'" class="perf-fairness" role="group" :aria-labelledby="inputId(control.key)" :aria-describedby="describedBy(control.key)">
              <div class="perf-share-bar" role="img" :aria-label="barLabel"><span v-for="tier in tiers" :key="tier" :class="`perf-share-${tier}`" :style="{ width: percent(tier) + '%' }" /></div>
              <div class="perf-share-inputs">
                <div v-for="tier in tiers" :key="tier"><label :for="`share-${tier}`">{{ tierTitle(tier) }} <span>{{ Math.round(percent(tier)) }}%</span></label>
                  <input :id="`share-${tier}`" class="ks-input kx-focus-halo" type="number" min="0" max="1000" step="1" :aria-label="`${tierTitle(tier)} shares`" :value="draft[control.key]?.[tier]" :disabled="saving" :aria-invalid="!!invalid[control.key]" :aria-describedby="describedBy(control.key)" @input="editShare(tier, $event)" />
                </div>
              </div>
              <p v-if="invalid[control.key]" :id="inputId(control.key) + '-error'" class="perf-invalid" role="alert">{{ invalid[control.key] }}</p>
            </div>
            <div v-else class="perf-value">
              <div class="perf-input-unit"><input :id="inputId(control.key)" class="ks-input kx-focus-halo" :type="control.min === undefined || control.durationMilliseconds ? 'text' : 'number'" :min="control.durationMilliseconds ? undefined : control.min" :max="control.durationMilliseconds ? undefined : control.max" step="1" :value="draft[control.key]" :disabled="saving" :aria-invalid="!!invalid[control.key]" :aria-describedby="describedBy(control.key)" @input="edit(control, $event)" /><span>{{ control.unit }}</span></div>
              <p v-if="invalid[control.key]" :id="inputId(control.key) + '-error'" class="perf-invalid" role="alert">{{ invalid[control.key] }}</p>
            </div>
          </div>
        </section>
        <p class="ap-hint">Reducing workers lets active executions finish before their slots retire. Changes apply without a restart.</p>
      </div>
    </div>
  </div>
</template>

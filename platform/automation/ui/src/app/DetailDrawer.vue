<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import { relativeTime } from '@widgets/app/datetime'
import WcMount from '@widgets/app/WcMount.vue'
import ActionMenu from './ActionMenu.vue'
import ExecutionHistory from './ExecutionHistory.vue'
import {
  collectMetrics, isFailureStatus, isTerminalStatus, rowMessage, statusPill, statusSeverity, subtitleOf, type Metric,
} from './row-status'
import { manageConfigOf, manageLocationOf, manageTagOf } from './custom-view'
import { driveFacts, driveProblem, type DriveStatus } from './drive-status'
import { host } from '@wippy-fe/proxy'
import { readDriveStatus } from './read-drive-status'
import { actionContextFor, buildActionItems, recoverMethod } from './action-model'
import type { Automation, AutomationType } from './automation-types'

// The per-automation detail screen: a right slide-over, shadow-safe (rendered in
// the manager's own tree, not teleported). An automation the round drives reads
// its run state from the generic status action on open; every tab otherwise
// reads the row's materialized public_state; Config mounts the kind's declared
// manage view, which owns its configuration. Actions are the same declared set the row menu renders — routed
// back to the manager to dispatch.
const props = withDefaults(defineProps<{ automation?: Automation; type?: AutomationType }>(), {
  automation: () => ({ id: '' } as Automation),
})
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'action', method: string): void
  (e: 'recover'): void
  (e: 'changed'): void
}>()

type Tab = 'overview' | 'state' | 'config' | 'activity'
const tab = ref<Tab>('overview')
const TABS: Array<{ id: Tab; label: string; icon: string }> = [
  { id: 'overview', label: 'Overview', icon: 'tabler:layout-dashboard' },
  { id: 'state', label: 'State', icon: 'tabler:chart-dots' },
  { id: 'config', label: 'Config', icon: 'tabler:settings' },
  { id: 'activity', label: 'Activity', icon: 'tabler:history' },
]

const name = computed(() => props.automation.title || props.automation.id)
const icon = computed(() => props.automation.icon || props.type?.icon || 'tabler:bolt')
const typeTitle = computed(() => props.type?.title || 'Automation')
const state = computed(() => props.automation.public_state)
const ctx = computed(() => actionContextFor(props.type))
const actions = computed(() => buildActionItems(ctx.value))
const hasStatusAction = computed(() => ctx.value.declared.includes('status'))
// The drives the status action answers, read on open and when the row's own
// drive status changes (after a control); the row's projection until then.
const drives = ref<DriveStatus | null>(null)
let driveReadVersion = 0
async function readDrawerStatus(id: string) {
  const version = ++driveReadVersion
  if (!id || !props.automation.drive_status || props.automation.availability) { drives.value = null; return }
  drives.value = props.automation.drive_status
  const status = await readDriveStatus(id)
  if (version === driveReadVersion && props.automation.id === id) drives.value = status
}
watch(() => [props.automation.id, props.automation.drive_status, props.automation.availability] as const, ([id]) => { void readDrawerStatus(id).catch(error => host.handleError('other', { message: String(error) })) }, { immediate: true })

const pill = computed(() => statusPill(state.value, hasStatusAction.value, drives.value, props.automation.availability))
const paused = computed(() => pill.value.kind === 'off')
const terminal = computed(() => isTerminalStatus(state.value))
const canToggle = computed(() => (ctx.value.declared.includes('pause') || ctx.value.declared.includes('resume')) && !terminal.value)
const failing = computed(() => isFailureStatus(state.value))
const recover = computed(() => recoverMethod(ctx.value.declared))
const errorText = computed(() => {
  if (props.automation.availability) return rowMessage(state.value, props.automation.availability)?.text || ''
  const problem = driveProblem(drives.value)
  if (problem) return problem
  const t = typeof state.value?.last_error === 'string' ? state.value.last_error.trim() : ''
  return failing.value ? t : ''
})

const when = computed(() => subtitleOf(props.type?.public_state_schema?.fields, state.value))
const stateMetrics = computed<Metric[]>(() => {
  const fields = props.type?.public_state_schema?.fields
  return [...collectMetrics(fields, state.value, false), ...collectMetrics(fields, state.value, true)]
})

interface OverviewFact { label: string; value: string }
const overviewFacts = computed<OverviewFact[]>(() => {
  const s = state.value
  const facts: OverviewFact[] = []
  facts.push({ label: 'Status', value: pill.value.label })
  if (!props.automation.availability) facts.push({ label: 'Enabled', value: paused.value ? 'Paused' : 'Yes' })
  if (when.value) facts.push({ label: 'When', value: when.value })
  if (s?.last_run_at) facts.push({ label: 'Last run', value: relativeTime(s.last_run_at, { future: true }) })
  if (s?.next_run_at) facts.push({ label: 'Next run', value: relativeTime(s.next_run_at, { future: true }) })
  for (const f of driveFacts(drives.value)) {
    facts.push({ label: f.label, value: f.time ? relativeTime(f.value, { future: true }) : f.value })
  }
  return facts
})

const lastRunAt = computed(() => {
  const rounds = drives.value?.drives.flatMap(d => typeof d.last_round_at === 'string' ? [d.last_round_at] : []) || []
  const failureAt = drives.value?.delivery_failures?.last_error?.at
  if (failureAt) rounds.push(failureAt)
  return rounds.sort().at(-1) || state.value?.last_run_at
})
const deliveryFailures = computed(() => drives.value?.delivery_failures)
const activityMessage = computed(() => {
  const failure = deliveryFailures.value?.last_error
  return failure ? `${failure.code}: ${failure.message}` : state.value?.last_error
})

// Config mounts the kind's declared manage view with the same config the manage
// dialog passes; a type that declares none has no configuration surface here.
const manageTag = computed(() => manageTagOf(props.type))
const manageConfig = computed(() => manageConfigOf(props.automation, props.type))
const manageMeta = computed(() => ({ location: manageLocationOf(props.type) }))

// A new target starts on the overview so the drawer never shows a stale view.
watch(() => props.automation.id, () => { tab.value = 'overview' })
</script>

<template>
  <div class="kx-drawer-scrim" @click="emit('close')"></div>
  <aside class="kx-drawer" role="dialog" aria-modal="true" :aria-label="name" data-testid="detail-drawer">
    <header class="kx-drawer-head">
      <span class="kx-ficon"><Icon :icon="icon" aria-hidden="true" /></span>
      <div class="kx-drawer-id">
        <div class="kx-drawer-name" :title="name">{{ name }}</div>
        <div class="kx-drawer-sub">{{ typeTitle }}</div>
      </div>
      <Tag :severity="statusSeverity(pill.kind)" class="kx-badge kx-tag-sm">
        <Icon v-if="pill.kind === 'live'" icon="tabler:loader-2" class="spin" aria-hidden="true" />
        {{ pill.label }}
      </Tag>
      <div class="kx-drawer-controls">
        <Button
          v-if="canToggle"
          type="button"
          severity="secondary"
          outlined
          size="small"
          :aria-label="`${paused ? 'Resume' : 'Pause'} ${name}`"
          :title="paused ? 'Resume' : 'Pause'"
          @click="emit('action', paused ? 'resume' : 'pause')"
        >
          <template #icon="{ class: iconClass }"><Icon :icon="paused ? 'tabler:player-play-filled' : 'tabler:player-pause'" aria-hidden="true" :class="iconClass" /></template>
        </Button>
        <ActionMenu :items="actions" :name="name" @select="(m) => emit('action', m)" />
        <Button
          type="button"
          severity="secondary"
          text
          size="small"
          class="kx-drawer-close"
          aria-label="Close details"
          title="Close"
          @click="emit('close')"
        >
          <template #icon="{ class: iconClass }"><Icon icon="tabler:x" aria-hidden="true" :class="iconClass" /></template>
        </Button>
      </div>
    </header>

    <nav class="kx-tabs" role="tablist">
      <button
        v-for="t in TABS"
        :key="t.id"
        type="button"
        role="tab"
        class="kx-tab"
        :class="tab === t.id && 'is-active'"
        :aria-selected="tab === t.id"
        :data-testid="`drawer-tab-${t.id}`"
        @click="tab = t.id"
      >
        <Icon :icon="t.icon" aria-hidden="true" /> {{ t.label }}
      </button>
    </nav>

    <div class="kx-drawer-body">
      <!-- Overview -->
      <section v-if="tab === 'overview'" class="kx-dsec">
        <div v-if="errorText" class="kx-errcard" data-testid="drawer-error-card">
          <div class="kx-errcard-head">
            <Icon icon="tabler:alert-circle" aria-hidden="true" />
            <span>{{ props.automation.availability ? 'This automation is unavailable' : 'This automation is failing' }}</span>
          </div>
          <p class="kx-errcard-cause">{{ errorText }}</p>
          <Button
            v-if="recover"
            type="button"
            size="small"
            severity="danger"
            :aria-label="`Recover ${name}`"
            data-testid="drawer-recover"
            label="Recover"
            @click="emit('recover')"
          >
            <template #icon="{ class: iconClass }"><Icon icon="tabler:rotate-clockwise-2" aria-hidden="true" :class="iconClass" /></template>
          </Button>
        </div>

        <div class="kx-dgrid">
          <div v-for="f in overviewFacts" :key="f.label" class="kx-dfact">
            <span class="kx-dfact-k">{{ f.label }}</span>
            <strong class="kx-dfact-v">{{ f.value }}</strong>
          </div>
        </div>

        <div v-if="stateMetrics.length" class="kx-dsub">
          <div class="kx-dsub-lbl">Progress</div>
          <div class="kx-metrics">
            <span v-for="m in stateMetrics" :key="m.label" class="kx-metric">
              <Icon v-if="m.icon" :icon="m.icon" class="kx-metric-i" aria-hidden="true" />
              <span class="kx-metric-k">{{ m.label }}</span>
              <span class="kx-metric-v" :title="m.title">{{ m.value }}</span>
            </span>
          </div>
        </div>
      </section>

      <!-- State -->
      <section v-else-if="tab === 'state'" class="kx-dsec">
        <div v-if="!stateMetrics.length" class="kx-dnote">This automation reports no additional state.</div>
        <div v-else class="kx-dgrid">
          <div v-for="m in stateMetrics" :key="m.label" class="kx-dfact">
            <span class="kx-dfact-k">{{ m.label }}</span>
            <strong class="kx-dfact-v" :title="m.title">{{ m.value }}</strong>
          </div>
        </div>
      </section>

      <!-- Config -->
      <section v-else-if="tab === 'config'" class="kx-dsec" data-testid="drawer-config">
        <WcMount v-if="!automation.availability && ((automation.access_level || 0) & 8) !== 0" tag="wc-execution-identity-editor" :attrs="{ root: automation.id }"
          @change="emit('changed')" />
        <WcMount
          v-if="manageTag"
          class="kx-manage-host"
          :tag="manageTag"
          :config="manageConfig"
          :meta="manageMeta"
          @change="emit('changed')"
          @close="tab = 'overview'"
        />
        <div v-else class="kx-dnote">This automation type declares no settings view.</div>
      </section>

      <!-- Activity -->
      <section v-else class="kx-dsec">
        <div class="kx-dgrid">
          <div class="kx-dfact">
            <span class="kx-dfact-k">Last run</span>
            <strong class="kx-dfact-v">{{ lastRunAt ? relativeTime(lastRunAt, { future: true }) : 'Never' }}</strong>
          </div>
          <div class="kx-dfact">
            <span class="kx-dfact-k">Last outcome</span>
            <strong class="kx-dfact-v">{{ deliveryFailures?.count ? 'Failed delivery' : state?.status || '—' }}</strong>
          </div>
          <div class="kx-dfact">
            <span class="kx-dfact-k">Failed deliveries</span>
            <strong class="kx-dfact-v">{{ deliveryFailures?.count ?? 0 }}</strong>
          </div>
        </div>
        <div v-if="typeof activityMessage === 'string' && activityMessage.trim()" class="kx-dsub">
          <div class="kx-dsub-lbl">Last message</div>
          <p class="kx-dmsg" :class="failing || deliveryFailures?.count ? 'is-err' : 'is-ok'">{{ activityMessage }}</p>
        </div>
        <ExecutionHistory v-if="!automation.availability && ((automation.access_level || 0) & 8) !== 0" :root="automation.id"
          @error="cause => host.handleError('other', { message: cause.message })" />
      </section>
    </div>
  </aside>
</template>

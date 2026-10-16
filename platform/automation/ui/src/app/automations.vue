<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import { api } from '@wippy-fe/proxy'
import WcMount from '@widgets/app/WcMount.vue'
import { useProps, useEvents, useHostVisibilityRefresh } from '@wippy-fe/webcomponent-vue'
import { errMsg } from '@widgets/app/errMsg'
import { relativeTime } from '@widgets/app/datetime'
import { useParentId } from '@widgets/app/useParentId'
import { inputPreset } from '@widgets/app/inputPreset'
import InstallDialog from './InstallDialog.vue'
import RowMetrics from './RowMetrics.vue'
import ActionMenu from './ActionMenu.vue'
import DetailDrawer from './DetailDrawer.vue'
import { useInstallFlow } from './useInstallFlow'
import { statusSeverity } from './row-status'
import { driveRunTimes } from './drive-status'
import { useAutomationPresentation } from './useAutomationPresentation.ts'
import { useAutomationRealtime } from './useAutomationRealtime.ts'
import { useAutomationData } from './useAutomationData.ts'
import { useAutomationExport } from './useAutomationExport.ts'
import type {
  Automation, AutomationType, DeleteOption,
} from './automation-types'

const dialogPt = {
  header: { class: 'kx-dialog-header' },
  content: { class: 'kx-dialog-content' },
  footer: { class: 'kx-dialog-footer' },
}

const automations = ref<Automation[]>([])
const types = ref<AutomationType[]>([])
const loading = ref(false)
const error = ref('')
const query = ref('')
const busyId = ref('')
// Keep an uncertain command's ID until its retry succeeds. The engine returns
// the recorded result for the same request ID and input.
const pendingControlIds = new Map<string, string>()
const exportId = ref('')
// The open detail drawer, keyed by row id so realtime state flows into it live.
const drawerId = ref('')

const presentation = useAutomationPresentation({ automations, types, query, drawerId })
const {
  typeById, filtered, pretty, typeFor, iconFor, declaredActions, hasAction, runNowFor,
  actionItemsFor, recoverFor, manageTag, manageLocation, manageConfig, statusFor,
  metrics, detailMetrics, isTerminal, rowMessage, statusOf, isPaused, subtitleLine,
  drawerAutomation, drawerType,
} = presentation
const realtime = useAutomationRealtime(automations, typeFor)
const { syncRealtimeSubscriptions, clearRealtimeSubscriptions, refreshDriveStatus } = realtime
const automationExport = useAutomationExport(exportId, error, pretty)
const { exportAutomation } = automationExport

// Workspace create-view mode: mounted with a parent-id, the manager opens straight
// to the install popup, hides its own chrome, and reports created/close to the shell
// (the "+" -> Automation flow). Without a parent-id it is the full Automations page.
const hostProps = useProps<{
  input?: unknown
  mode?: string
  parentId?: string
  componentId?: string
  'component-id'?: string
  typeId?: string
}>()
const hostEvents = useEvents<{ created: { id?: string }; close: Record<string, never> }>()
// The workspace passes mode="create" to every create view (createAttrs); this is the
// reliable create-surface signal — parent-id is EMPTY at the workspace root, so keying
// off it would leave the full page showing there.
const createMode = computed(() => hostProps.value?.mode === 'create')
const componentMode = computed(() => hostProps.value?.mode === 'component')
// parent-id is the folder to place the new automation under (empty = root).
// WippyVueElement exposes host attributes camelCased (parent-id -> parentId).
const parentId = useParentId(hostProps)
const componentId = computed(() => String(hostProps.value?.componentId || '').trim())
const preferredTypeId = computed(() => String(hostProps.value?.typeId || '').trim())
const effectiveParentId = computed(() => componentId.value || parentId.value)
const data = useAutomationData({
  automations, types, loading, error,
  parentId: () => componentId.value || undefined,
  syncRealtimeSubscriptions,
})
const { fetchTypes, fetchAutomations, reload } = data

// The install popup owns its own state machine; this page hands it the host
// context it renders under and the reload it triggers on success.
const install = useInstallFlow({
  types,
  createMode,
  componentMode,
  effectiveParentId,
  preferredTypeId,
  inputPreset: computed(() => inputPreset(hostProps.value?.input)),
  emitHost: (name, detail) => hostEvents(name, detail as never),
  reload: () => reload(),
})


// Uninstall flow state (in-component modal — sandboxed iframe ignores confirm).
const confirmTarget = ref<Automation | null>(null)
const deleteChoices = ref<Record<string, boolean>>({})
const deleting = ref(false)

// Kind-specific manage flow. A type declares meta.component.manage.view; the
// backend resolves it to component.manage_ui and the edit action mounts it here.
const manageTarget = ref<Automation | null>(null)
// An automation is a component, so it shares through the generic component
// access endpoints and the shared kickside-share popup, exactly as every other
// component surface does. The server decides who may grant.
const shareTarget = ref<Automation | null>(null)
function askShare(a: Automation) { shareTarget.value = a }
function closeShare() { shareTarget.value = null }
function shareConfig(a: Automation | null) {
  const id = a?.id || ''
  return {
    resource_id: id,
    access_url: `/api/v1/component-access/grants/${encodeURIComponent(id)}`,
    share_url: `/api/v1/component-access/share/${encodeURIComponent(id)}`,
    title: a ? pretty(a) : '',
  }
}

// Route a menu/drawer action to the flow that owns it: the shell operations open
// their dialogs; every declared method posts through the generic action endpoint.
function dispatchAction(a: Automation, method: string) {
  switch (method) {
    case 'reconfigure': askEdit(a); break
    case 'share': askShare(a); break
    case 'export': void exportAutomation(a); break
    case 'delete': askRemove(a); break
    default: void runAction(a, method)
  }
}
function dispatchRecover(a: Automation) {
  const method = recoverFor(a)
  if (method) void runAction(a, method)
}

// ─── Detail drawer ─────────────────────────────────────────────────────
// The open drawer tracks a row id, so realtime public_state updates flow into it
// live and a reload after an action re-resolves the same row.
function openDrawer(a: Automation) {
  drawerId.value = a.id
  void fetchAutomations()
}
function closeDrawer() { drawerId.value = '' }
function onDrawerAction(method: string) {
  const a = drawerAutomation.value
  if (a) dispatchAction(a, method)
}
function onDrawerRecover() {
  const a = drawerAutomation.value
  if (a) dispatchRecover(a)
}

// ─── Controls (pause / resume / trigger) ───────────────────────────────
async function runAction(a: Automation, method: string) {
  if (busyId.value) return
  busyId.value = a.id
  error.value = ''
  const control = typeFor(a)?.controls?.some(c => c.name === method) === true
  const requestKey = `${a.id}:${method}`
  const requestId = control
    ? pendingControlIds.get(requestKey) || crypto.randomUUID()
    : ''
  if (control) pendingControlIds.set(requestKey, requestId)
  try {
    const { data } = await api.post(`/api/v1/automations/${a.id}/actions/${method}`,
      control ? { request_id: requestId } : {})
    if (!data?.success) {
      error.value = errMsg({ response: { data } }, `${method} failed`)
      return
    }
    if (control && data.result?.state === 'succeeded') pendingControlIds.delete(requestKey)
    // Reconcile the response immediately. Realtime remains the cross-tab source
    // of truth, but a delayed/missed event must not leave this control looking as
    // though pause or resume did nothing.
    if (data.result && typeof data.result === 'object') {
      const { success: _success, ...resultState } = data.result
      a.public_state = { ...(a.public_state || {}), ...resultState }
    }
    if (a.drive_status?.drives?.length) {
      // An automation the round drives reports its run state through the
      // generic drive status: read it again after any control.
      await refreshDriveStatus(a.id)
    } else if (method === 'pause' || method === 'resume') {
      const paused = typeof data.result?.paused === 'boolean'
        ? data.result.paused
        : method === 'pause'
      a.public_state = {
        ...(a.public_state || {}),
        enabled: !paused,
        status: data.result?.status || (paused ? 'paused' : 'active'),
      }
    }
  } catch (e) {
    error.value = errMsg(e, `${method} failed`)
  } finally {
    busyId.value = ''
  }
}

async function toggleEnabled(a: Automation) {
  await runAction(a, isPaused(a) ? 'resume' : 'pause')
}

// ─── Uninstall flow ────────────────────────────────────────────────────
function askRemove(a: Automation) {
  confirmTarget.value = a
  const t = typeFor(a)
  const choices: Record<string, boolean> = {}
  for (const opt of t?.delete_options || []) choices[opt.key] = !!opt.default
  deleteChoices.value = choices
}
function deleteOptions(a: Automation | null): DeleteOption[] {
  if (!a) return []
  return typeFor(a)?.delete_options || []
}

// Delete lives in the manage dialog's footer, not the row: close it and hand off
// to the same confirm flow the row used.
function askRemoveFromDialog(a: Automation) {
  manageTarget.value = null
  askRemove(a)
}

async function doRemove() {
  const a = confirmTarget.value
  if (!a) return
  deleting.value = true
  error.value = ''
  try {
    const opts = deleteOptions(a)
    const body = opts.length ? { options: { ...deleteChoices.value } } : {}
    const { data } = await api.delete(`/api/v1/automations/${a.id}`, { data: body })
    if (data?.success) {
      confirmTarget.value = null
      await fetchAutomations()
    } else {
      error.value = errMsg({ response: { data } }, 'failed to delete automation')
    }
  } catch (e) {
    error.value = errMsg(e, 'failed to delete automation')
  } finally {
    deleting.value = false
  }
}

// ─── Manage flow ───────────────────────────────────────────────────────
// Edit mounts the kind's declared manage view; the action exists only for a
// type that declares one.
function askEdit(a: Automation) {
  if (manageTag(a)) manageTarget.value = a
}

async function closeManage(reloadList = true) {
  manageTarget.value = null
  if (reloadList) await reload()
}

useHostVisibilityRefresh(async () => {
  try {
    await reload()
    if (createMode.value) install.openPreferredInstall()
  } catch (e) {
    error.value = errMsg(e, 'host API unavailable')
  }
})
onBeforeUnmount(() => {
  install.unmountCustomInstallUi()
  clearRealtimeSubscriptions()
})
</script>

<template>
  <div class="kx">
    <header v-if="!createMode" class="kx-head">
      <template v-if="!componentMode">
        <div class="kx-head-icon"><Icon icon="tabler:bolt" aria-hidden="true" /></div>
        <div class="kx-head-text">
          <h1 class="kx-head-title">Automations</h1>
          <p class="kx-head-sub">Scheduled and event-driven jobs that run on their own.</p>
        </div>
      </template>
      <div class="kx-head-actions">
        <span class="kx-count">{{ automations.length }} automation{{ automations.length !== 1 ? 's' : '' }}</span>
        <div class="kx-search">
          <Icon icon="tabler:search" class="kx-search-ico" aria-hidden="true" />
          <input v-model="query" class="kx-search-input" type="text" placeholder="Search automations…" />
        </div>
        <Button type="button" data-testid="automations-add" label="Add automation" @click="install.openPreferredInstall()">
          <template #icon="{ class: iconClass }"><Icon icon="tabler:plus" :class="iconClass" aria-hidden="true" /></template>
        </Button>
      </div>
    </header>

    <div v-if="!createMode && error" class="kx-err">{{ error }}</div>

    <div v-if="!createMode" class="kx-body">
      <div v-if="loading && !automations.length" class="kx-loading">
        <Icon icon="tabler:loader-2" class="spin" aria-hidden="true" /> Loading…
      </div>

      <div v-else-if="!automations.length" class="kx-empty">
        <div class="kx-empty-ico"><Icon icon="tabler:bolt" aria-hidden="true" /></div>
        <div class="kx-empty-title">No automations yet</div>
        <div class="kx-empty-sub">Choose an automation type to get started.</div>
        <Button type="button" data-testid="automations-add" label="Add automation" @click="install.openPreferredInstall()">
          <template #icon="{ class: iconClass }"><Icon icon="tabler:plus" :class="iconClass" aria-hidden="true" /></template>
        </Button>
      </div>

      <div v-else-if="!filtered.length" class="kx-empty">
        <div class="kx-empty-title">No matches</div>
        <div class="kx-empty-sub">No automations match the current search.</div>
      </div>

      <div v-else class="kx-list">
        <div v-for="a in filtered" :key="a.id" class="kx-row" :class="drawerId === a.id && 'is-open'">
          <button type="button" class="kx-open" :aria-label="`Open ${pretty(a)} details`" @click="openDrawer(a)">
            <span class="kx-ficon"><Icon :icon="iconFor(a)" aria-hidden="true" /></span>
            <span class="kx-id">
              <span class="kx-name" :title="pretty(a)">{{ pretty(a) }}</span>
              <span class="kx-sub">
                <span>{{ typeFor(a)?.title || 'Automation' }}</span>
                <span v-if="subtitleLine(a)"> · {{ subtitleLine(a) }}</span>
                <span v-if="driveRunTimes(a.drive_status).last"> · last ran {{ relativeTime(driveRunTimes(a.drive_status).last, { future: true }) }}</span>
                <span v-if="driveRunTimes(a.drive_status).next"> · next {{ relativeTime(driveRunTimes(a.drive_status).next, { future: true }) }}</span>
              </span>
            </span>
          </button>

          <Tag :severity="statusSeverity(statusOf(a).kind)" class="kx-badge kx-tag-sm">
            <Icon v-if="statusOf(a).kind === 'live'" icon="tabler:loader-2" class="spin" aria-hidden="true" />
            {{ statusOf(a).label }}
          </Tag>

          <div class="kx-actions">
            <Button
              type="button"
              severity="secondary"
              outlined
              size="small"
              v-if="(hasAction(a, 'pause') || hasAction(a, 'resume')) && !isTerminal(a)"
              :disabled="busyId === a.id"
              :aria-label="`${isPaused(a) ? 'Resume' : 'Pause'} ${pretty(a)}`"
              :title="isPaused(a) ? 'Resume' : 'Pause'"
              @click="toggleEnabled(a)"
            >
              <template #icon="{ class: iconClass }"><Icon :icon="isPaused(a) ? 'tabler:player-play-filled' : 'tabler:player-pause'" aria-hidden="true" :class="iconClass" /></template>
            </Button>
            <ActionMenu :items="actionItemsFor(a)" :name="pretty(a)" :busy="busyId === a.id" @select="dispatchAction(a, $event)" />
          </div>

          <div v-if="rowMessage(a) || detailMetrics(a).length || metrics(a).length" class="kx-rowfoot">
            <div v-if="rowMessage(a)" class="kx-rowmsg" :class="`kx-rowmsg-${rowMessage(a)?.tone}`">
              <Icon :icon="rowMessage(a)?.tone === 'error' ? 'tabler:alert-circle' : 'tabler:circle-check'" aria-hidden="true" />
              <span class="kx-rowmsg-txt" :title="rowMessage(a)?.text">{{ rowMessage(a)?.text }}</span>
              <Button
                v-if="rowMessage(a)?.tone === 'error' && recoverFor(a)"
                type="button"
                severity="danger"
                text
                size="small"
                class="kx-recover"
                data-testid="row-recover"
                :aria-label="`Recover ${pretty(a)}`"
                :disabled="busyId === a.id"
                label="Recover"
                @click="dispatchRecover(a)"
              >
                <template #icon="{ class: iconClass }"><Icon icon="tabler:rotate-clockwise-2" aria-hidden="true" :class="iconClass" /></template>
              </Button>
            </div>
            <RowMetrics :face="metrics(a)" :detail="detailMetrics(a)" />
          </div>
        </div>
      </div>
    </div>

    <DetailDrawer
      v-if="drawerAutomation"
      :automation="drawerAutomation"
      :type="drawerType"
      @close="closeDrawer"
      @action="onDrawerAction"
      @recover="onDrawerRecover"
      @changed="fetchAutomations"
    />

    <InstallDialog :flow="install" :component-mode="componentMode" :dialog-pt="dialogPt" />

    <!-- Kind-specific manage view. The mounted component owns its own edit
         semantics; this shell only supplies the instance id and refreshes on close. -->
    <Dialog
      v-if="manageTarget"
      :visible="!!manageTarget"
      :modal="true"
      :dismissable-mask="true"
      :pt="dialogPt"
      class="kx-modal kx-modal-manage"
      :aria-label="pretty(manageTarget)"
      @update:visible="(v) => { if (!v) closeManage(false) }"
    >
      <template #header>
        <span class="kx-modal-head-icon"><Icon :icon="iconFor(manageTarget)" aria-hidden="true" /></span>
        <span class="kx-modal-head-text">
          <span class="kx-modal-head-title">{{ pretty(manageTarget) }}</span>
          <span class="kx-modal-head-sub">{{ typeFor(manageTarget)?.title || 'Automation' }}</span>
        </span>
      </template>
      <div class="kx-modal-body">
        <WcMount
          class="kx-manage-host"
          :tag="manageTag(manageTarget)"
          :config="manageConfig(manageTarget)"
          :meta="{ location: manageLocation(manageTarget) }"
          @created="closeManage(true)"
          @close="closeManage(true)"
          @change="fetchAutomations"
        />
      </div>
      <template #footer>
        <Button type="button" class="kx-foot-delete" severity="danger" outlined label="Delete" @click="askRemoveFromDialog(manageTarget)">
          <template #icon="{ class: iconClass }"><Icon icon="tabler:trash" aria-hidden="true" :class="iconClass" /></template>
        </Button>
      </template>
    </Dialog>

    <!-- Share. The component access popup, mounted by tag like every other
         component surface, so one widget owns the grant UI. -->
    <Dialog
      v-if="shareTarget"
      :visible="!!shareTarget"
      modal
      :pt="dialogPt"
      class="kx-modal"
      :aria-label="`Share ${pretty(shareTarget)}`"
      @update:visible="(v) => { if (!v) closeShare() }"
    >
      <template #header>
        <span class="kx-modal-head-icon"><Icon icon="tabler:users" aria-hidden="true" /></span>
        <span class="kx-modal-head-text">
          <span class="kx-modal-head-title">Share {{ pretty(shareTarget) }}</span>
          <span class="kx-modal-head-sub">{{ typeFor(shareTarget)?.title || 'Automation' }}</span>
        </span>
      </template>
      <div class="kx-modal-body">
        <WcMount
          class="kx-manage-host"
          tag="kickside-share"
          :config="shareConfig(shareTarget)"
          @close="closeShare"
          @change="fetchAutomations"
        />
      </div>
    </Dialog>

    <!-- Delete confirm. The facade iframe is sandboxed without allow-modals,
         so a plain in-component modal replaces window.confirm. -->
    <Dialog
      v-if="confirmTarget"
      :visible="!!confirmTarget"
      :modal="true"
      :dismissable-mask="true"
      :pt="dialogPt"
      class="kx-modal"
      header="Delete automation"
      aria-label="Delete automation"
      @update:visible="(v) => { if (!v) confirmTarget = null }"
    >
      <div class="kx-modal-body">
        <p>
          Delete <strong>{{ pretty(confirmTarget) }}</strong>? It will stop running and its setup will be removed. This can't be undone.
        </p>
        <div v-if="deleteOptions(confirmTarget).length" class="kx-delopts">
          <label v-for="opt in deleteOptions(confirmTarget)" :key="opt.key" class="kx-delopt">
            <input v-model="deleteChoices[opt.key]" type="checkbox" />
            <span class="kx-delopt-copy">
              <span class="kx-delopt-t">{{ opt.title || opt.key }}</span>
              <span v-if="opt.description" class="kx-delopt-d">{{ opt.description }}</span>
            </span>
          </label>
        </div>
      </div>
      <template #footer>
        <Button type="button" label="Cancel" severity="secondary" outlined :disabled="deleting" @click="confirmTarget = null" />
        <Button type="button" data-testid="automations-confirm-delete" severity="danger" label="Delete" :loading="deleting" :disabled="deleting" @click="doRemove">
          <template #icon="{ class: iconClass }"><Icon icon="tabler:trash" :class="iconClass" aria-hidden="true" /></template>
        </Button>
      </template>
    </Dialog>
  </div>
</template>

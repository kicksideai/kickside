<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'
import NativeDialog from '@widgets/app/NativeDialog.vue'
import PickerSelect from '@widgets/app/PickerSelect.vue'
import { loadByTagName } from '@wippy-fe/proxy'
import { relativeTime } from '@widgets/app/datetime'
import {
  moduleLabel, moduleIcon, moduleAccent, isAppModule,
  fmtNum, fmtBytes, requirementKey,
} from '../lib.ts'
import { SEVERITY_META, type ScanFinding } from '../scan.ts'
import { useInstallDialog, type InstallDialogProps, type SectionKey, type HubPlanRequirement } from './useInstallDialog.ts'
import type { HubModuleListItem } from '../keeper-hub.ts'

const props = defineProps<InstallDialogProps>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'changed'): void }>()

const c = useInstallDialog(props, emit)

const SECTIONS: { key: SectionKey; label: string; icon: string }[] = [
  { key: 'overview', label: 'Overview', icon: 'tabler:info-circle' },
  { key: 'modules', label: 'Modules', icon: 'tabler:hierarchy-2' },
  { key: 'requirements', label: 'Requirements', icon: 'tabler:adjustments' },
  { key: 'scan', label: 'Security scan', icon: 'tabler:shield-check' },
  { key: 'review', label: 'Review & install', icon: 'tabler:checklist' },
]

const item = computed<HubModuleListItem>(() =>
  props.catalogItem || ({ full_name: props.component, component: props.component } as HubModuleListItem))
const accent = computed(() => moduleAccent(item.value))
const title = computed(() => props.mode === 'update' ? 'Update module' : 'Install module')

function requirementSelectOptions(req: HubPlanRequirement): { label: string; value: string; title?: string }[] {
  const opts = c.requirementOptions(req)
  const v = c.requirementValue(req)
  if (v && !opts.some(o => o.value === v)) return [{ label: `${v} (current)`, value: v }, ...opts]
  return opts
}
function requirementOptionListId(req: HubPlanRequirement): string {
  return `km-req-options-${requirementKey(req).replace(/[^a-zA-Z0-9_-]/g, '-')}`
}
function sourceLabel(req: HubPlanRequirement): string {
  const map: Record<string, string> = {
    provided: 'you set this', provided_bare: 'you set this',
    existing: 'auto-detected', existing_bare: 'auto-detected',
    default: 'package default', registry: 'from registry', conflict: 'multiple candidates — pick one',
  }
  return map[String(req.value_source || '')] || ''
}

const mainRef = ref<HTMLElement | null>(null)
const flashing = ref(false)
let flashTimer: ReturnType<typeof setTimeout> | undefined
onUnmounted(() => clearTimeout(flashTimer))
watch(() => c.highlightTick.value, async (_value, _previous, onCleanup) => {
  let current = true
  onCleanup(() => { current = false })
  if (c.activeSection.value !== 'requirements') return
  await nextTick()
  if (!current) return
  const el = mainRef.value?.querySelector('.km-req.is-missing, .km-req.is-invalid') as HTMLElement | null
  el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  flashing.value = true
  clearTimeout(flashTimer)
  flashTimer = setTimeout(() => { flashing.value = false }, 1200)
})

function findingTone(f: ScanFinding): string { return SEVERITY_META[f.severity].tone }
function modDotClass(status: string): string {
  if (status === 'critical' || status === 'error') return 'km-dot-danger'
  if (status === 'warnings') return 'km-dot-warn'
  return 'km-dot-ok'
}
function planBadgeClass(tone: string): string {
  return `km-plan-badge kx-tag-caps km-plan-badge-${tone}`
}
function ledgerClass(status: string): string {
  if (status === 'failed' || status === 'rollback_failed') return 'km-ledger-bad'
  if (status === 'rolled_back') return 'km-ledger-warn'
  return 'km-ledger-ok'
}

const progressPhaseLabel = computed(() => c.progressPhase.value || (props.mode === 'update' ? 'Updating…' : 'Installing…'))

onMounted(() => { void loadByTagName('wc-render-markdown', { timeoutMs: 8000 }).catch(() => {}) })
</script>

<template>
  <NativeDialog
    :visible="open"
    :busy="c.running.value || c.dryRunning.value"
    :label="title"
    class="km-dialog km-dialog-2p"
    header-class="km-modal-head km-2p-head"
    content-class="km-dialog-content km-dialog-content-2p"
    footer-class="km-modal-foot km-2p-foot"
    :style="{ '--accent': accent }"
    @close="c.close()"
  >
      <template #header>
        <span class="km-2p-head-icon"><Icon :icon="moduleIcon(item)" aria-hidden="true" /></span>
        <span class="km-2p-head-text">
          <span class="km-2p-head-title">{{ title }}</span>
          <span class="km-2p-head-sub">{{ moduleLabel(item) }} <span class="km-dim km-mono">{{ props.component }}</span></span>
        </span>
      </template>

      <div class="km-2p">
        <!-- Left rail: sections + live status -->
        <nav class="km-2p-nav" aria-label="Install steps">
          <button
            v-for="s in SECTIONS"
            :key="s.key"
            class="km-2p-navitem"
            :class="{ active: c.activeSection.value === s.key }"
            @click="c.activeSection.value = s.key"
          >
            <Icon :icon="s.icon" class="km-i" aria-hidden="true" />
            <span class="km-2p-navlabel">{{ s.label }}</span>
            <span class="km-2p-navstatus">
              <Icon v-if="c.sectionStatus.value[s.key].tone === 'loading'" icon="tabler:loader-2" class="km-i-sm spin km-dim" aria-hidden="true" />
              <Icon v-else-if="c.sectionStatus.value[s.key].tone === 'ok'" icon="tabler:circle-check-filled" class="km-i-sm km-sev-ok-fg" aria-hidden="true" />
              <span v-else-if="c.sectionStatus.value[s.key].tone === 'danger'" class="km-dot km-dot-danger" aria-hidden="true" />
              <span v-else-if="c.sectionStatus.value[s.key].tone === 'warn'" class="km-dot km-dot-warn" aria-hidden="true" />
              <span v-if="c.sectionStatus.value[s.key].badge" class="km-navbadge">{{ c.sectionStatus.value[s.key].badge }}</span>
            </span>
          </button>
        </nav>

        <!-- Right: active section -->
        <div ref="mainRef" class="km-2p-main">
          <!-- ─────────── Overview ─────────── -->
          <section v-show="c.activeSection.value === 'overview'" class="km-sec">
            <div class="km-ov-hero">
              <span class="km-ov-icon"><Icon :icon="moduleIcon(item)" class="km-i-lg" aria-hidden="true" /></span>
              <div class="km-grow km-min0">
                <div class="km-row-wrap">
                  <span class="km-ov-name">{{ moduleLabel(item) }}</span>
                  <span v-if="isAppModule(item)" class="badge-app kx-tag-caps">app</span>
                  <span v-if="item.deprecated" class="badge-warn kx-tag-caps">deprecated</span>
                </div>
                <div class="km-ov-org km-mono">{{ props.component }}</div>
              </div>
            </div>
            <p v-if="item.description" class="km-ov-desc">{{ item.description }}</p>
            <p v-if="props.mode === 'update' && !props.currentId" class="km-hint">
              Updating this module creates an application root dependency for the selected version.
              This version also applies to modules that depend on it; the plan shows any conflicts.
            </p>

            <div class="km-field">
              <label class="km-label">Version</label>
              <div class="km-row-gap">
                <PickerSelect
                  v-model="c.version.value"
                  class="km-sort km-grow"
                  :items="c.versionOptions.value.map(o => ({ id: o.value, title: o.label }))"
                  placeholder="latest"
                  aria-label="Version"
                />
              </div>
              <div class="km-seg" role="group" aria-label="Version mode">
                <button class="km-seg-btn" :aria-pressed="c.versionMode.value === 'pin'" :class="{ active: c.versionMode.value === 'pin' }" @click="c.versionMode.value = 'pin'">
                  <Icon icon="tabler:pin" class="km-i-sm" aria-hidden="true" /> Pin {{ c.version.value || 'latest' }}
                </button>
                <button class="km-seg-btn" :aria-pressed="c.versionMode.value === 'track'" :class="{ active: c.versionMode.value === 'track' }" @click="c.versionMode.value = 'track'">
                  <Icon icon="tabler:arrow-up-circle" class="km-i-sm" aria-hidden="true" /> Track updates
                </button>
              </div>
              <p class="km-hint">
                {{ c.versionMode.value === 'pin'
                  ? 'Locks to this exact version; future updates are manual.'
                  : `Tracks ${c.version.value ? '≥ ' + c.version.value : 'all'} releases on the next resolve.` }}
              </p>
            </div>

            <div class="km-ov-meta">
              <div class="km-meta-row"><Icon icon="tabler:download" class="km-i-sm" aria-hidden="true" /><span>Downloads</span><b>{{ fmtNum(item.total_downloads) }}</b></div>
              <div v-if="item.favorites_count" class="km-meta-row"><Icon icon="tabler:star" class="km-i-sm" aria-hidden="true" /><span>Favorites</span><b>{{ item.favorites_count }}</b></div>
              <div v-if="item.license" class="km-meta-row"><Icon icon="tabler:license" class="km-i-sm" aria-hidden="true" /><span>License</span><b>{{ item.license }}</b></div>
              <div v-if="item.type" class="km-meta-row"><Icon icon="tabler:category" class="km-i-sm" aria-hidden="true" /><span>Type</span><b>{{ item.type }}</b></div>
              <div v-if="c.versionMeta.value?.entry_count" class="km-meta-row"><Icon icon="tabler:list-numbers" class="km-i-sm" aria-hidden="true" /><span>Entries</span><b>{{ c.versionMeta.value.entry_count }}</b></div>
              <div v-if="c.versionMeta.value?.size_bytes" class="km-meta-row"><Icon icon="tabler:weight" class="km-i-sm" aria-hidden="true" /><span>Size</span><b>{{ fmtBytes(c.versionMeta.value.size_bytes) }}</b></div>
              <div v-if="item.update_time" class="km-meta-row"><Icon icon="tabler:clock" class="km-i-sm" aria-hidden="true" /><span>Updated</span><b>{{ relativeTime(item.update_time, { maxUnit: 'year' }) }}</b></div>
            </div>

            <div v-if="c.readmeLoading.value" class="km-loading"><Icon icon="tabler:loader-2" class="km-i spin" aria-hidden="true" /> Loading README…</div>
            <article v-else-if="c.readme.value" class="km-ov-readme">
              <wc-render-markdown :source="c.readme.value"></wc-render-markdown>
            </article>
          </section>

          <!-- ─────────── Modules ─────────── -->
          <section v-show="c.activeSection.value === 'modules'" class="km-sec">
            <template v-if="c.planLoading.value">
              <div class="km-skel km-skel-line" style="width: 40%" />
              <div class="km-skel km-skel-card" v-for="i in 4" :key="i" />
            </template>
            <template v-else-if="c.planError.value">
              <div class="km-msg km-msg-err"><span v-if="c.planCode.value" class="km-code">{{ c.planCode.value }}</span>{{ c.planError.value }}</div>
            </template>
            <template v-else-if="c.plan.value">
              <div class="km-sec-title"><Icon icon="tabler:hierarchy-2" class="km-i km-accent" aria-hidden="true" /> Installs {{ c.moduleCount.value }} module{{ c.moduleCount.value === 1 ? '' : 's' }}
                <span v-if="c.totalSize.value" class="km-dim">· {{ fmtBytes(c.totalSize.value) }}</span>
              </div>
              <p class="km-hint">The module plus its full dependency chain (ns.dependency), resolved to these versions.</p>

              <div v-for="n in c.planRows.value" :key="n.path || n.module" class="km-mrow" :class="{ 'km-mrow-direct': n.direct || n.module === props.component, 'km-mrow-transitive': !(n.direct || n.module === props.component) }" :style="{ '--tree-level': n.level }">
                <Icon v-if="n.level > 0" icon="tabler:corner-down-right" class="km-i-sm km-dim" aria-hidden="true" />
                <span v-else class="km-tree-spacer" aria-hidden="true" />
                <span class="km-mrow-badge kx-tag-caps">{{ n.direct || n.module === props.component ? 'direct' : 'transitive' }}</span>
                <span class="km-mrow-name km-mono">{{ n.module }}</span>
                <span v-if="n.version" class="km-mrow-ver km-mono">{{ n.version }}</span>
                <span v-if="n.constraint" class="km-dim km-mono">{{ n.constraint }}</span>
                <span class="km-grow" />
                <span v-for="b in c.badgesForNode(n)" :key="b.label" :class="planBadgeClass(b.tone)">{{ b.label }}</span>
                <span v-if="n.size_bytes" class="km-dim">{{ fmtBytes(n.size_bytes) }}</span>
              </div>
            </template>
          </section>

          <!-- ─────────── Requirements ─────────── -->
          <section v-show="c.activeSection.value === 'requirements'" class="km-sec">
            <template v-if="c.planLoading.value">
              <div class="km-skel km-skel-line" style="width: 30%" />
              <div class="km-skel km-skel-field" v-for="i in 3" :key="i" />
            </template>
            <template v-else-if="!c.requirements.value.length">
              <div class="km-empty-inline"><Icon icon="tabler:circle-check" class="km-i-lg km-sev-ok-fg" aria-hidden="true" /><p>Nothing to configure — this module binds no host resources.</p></div>
            </template>
            <template v-else>
              <div class="km-sec-title"><Icon icon="tabler:adjustments" class="km-i km-accent" aria-hidden="true" /> Configuration <span class="km-dim">({{ c.boundRequirementCount.value }}/{{ c.requirements.value.length }} set)</span></div>
              <div class="km-req-toolbar">
                <p class="km-hint km-grow">Bind root requirements to host resources. Transitive requirements are shown for review and are configured by their owning module.</p>
                <button v-if="c.aiResolvableCount.value" class="km-btn km-btn-secondary km-btn-outlined km-btn-sm" :disabled="c.aiResolving.value || !c.planCurrent.value" @click="c.resolveRequirementsWithAI(mainRef)">
                  <Icon :icon="c.aiResolving.value ? 'tabler:loader-2' : 'tabler:sparkles'" :class="['km-i', c.aiResolving.value && 'spin']" aria-hidden="true" />
                  {{ c.aiResolving.value ? 'Resolving…' : 'Resolve with AI' }}
                </button>
                <button v-if="c.missingRequirements.value.length" class="km-btn km-btn-secondary km-btn-outlined km-btn-sm" :disabled="c.autoFitCount.value === 0" @click="c.autoFitRequirements()">
                  <Icon icon="tabler:wand" class="km-i" aria-hidden="true" /> Auto-fit
                </button>
              </div>

              <div v-if="c.aiResolutionNotice.value" class="km-msg" :class="c.aiResolutionNotice.value.tone === 'success' ? 'km-msg-ok' : 'km-msg-warn'" role="status">
                <span v-if="c.aiResolutionNotice.value.code" class="km-code">{{ c.aiResolutionNotice.value.code }}</span>
                <span v-if="c.aiResolutionNotice.value.kind" class="km-code">{{ c.aiResolutionNotice.value.kind }}</span>
                {{ c.aiResolutionNotice.value.message }}
                <pre v-if="c.aiResolutionNotice.value.details" class="km-mono">{{ JSON.stringify(c.aiResolutionNotice.value.details, null, 2) }}</pre>
              </div>

              <div v-if="c.pendingCount.value" class="km-req-toolbar" role="status">
                <span class="km-grow">Review {{ c.pendingCount.value }} AI suggestion{{ c.pendingCount.value === 1 ? '' : 's' }} before applying.</span>
                <button class="km-btn km-btn-sm" :disabled="!c.planCurrent.value" @click="c.acceptSuggestions(Object.keys(c.pendingSuggestions.value))">Accept all</button>
                <button class="km-btn km-btn-secondary km-btn-sm" @click="c.rejectSuggestions(Object.keys(c.pendingSuggestions.value))">Reject all</button>
                <button class="km-btn km-btn-secondary km-btn-sm" :disabled="!c.planCurrent.value" @click="c.editSuggestions(Object.keys(c.pendingSuggestions.value))">Edit all</button>
              </div>

              <div v-for="g in c.requirementGroups.value" :key="g.module" class="km-req-group">
                <div class="km-req-group-head">
                  <Icon :icon="g.direct ? 'tabler:package' : 'tabler:corner-down-right'" class="km-i-sm" aria-hidden="true" />
                  <span class="km-mono">{{ g.module }}</span>
                    <span v-if="!g.direct" class="km-dim">dependency</span>
                  </div>

                <div v-for="req in g.items" :key="requirementKey(req)" class="km-req" :class="{ 'is-missing': c.requirementMissing(req), 'is-invalid': c.requirementTypeInvalid(req), 'is-flash': flashing && (c.requirementMissing(req) || c.requirementTypeInvalid(req)) }">
                  <div class="km-req-meta">
                    <span class="km-mono km-req-name">{{ req.name || requirementKey(req) }}</span>
                    <span v-if="req.required || req.missing" class="km-req-flag">required</span>
                    <span v-if="req.expected_kind" class="km-chip km-mono">{{ req.expected_kind }}</span>
                    <span class="km-grow" />
                    <button
                      v-if="c.requirementMissing(req) && c.canAutoFitRequirement(req)"
                      class="km-btn km-btn-secondary km-btn-outlined km-btn-sm km-req-fit"
                      @click="c.autoFitRequirement(req)"
                    >
                      <Icon icon="tabler:wand" class="km-i-sm" aria-hidden="true" /> Auto-fit
                    </button>
                  </div>

                  <template v-if="!c.requirementReadOnly(req)">
                    <input
                    class="km-input km-w-full"
                    :aria-label="req.name || requirementKey(req)"
                    :disabled="c.running.value || c.dryRunning.value"
                    :value="c.requirementValue(req)"
                    :list="requirementSelectOptions(req).length ? requirementOptionListId(req) : undefined"
                    :placeholder="c.displayValue(req.default) || (req.expected_kind ? `Enter ${req.expected_kind} id` : 'Enter registry id or value')"
                    @input="c.setParameter(req, ($event.target as HTMLInputElement).value)"
                    />
                    <datalist v-if="requirementSelectOptions(req).length" :id="requirementOptionListId(req)">
                      <option v-for="o in requirementSelectOptions(req)" :key="o.value" :value="o.value" :title="o.title">{{ o.label }}</option>
                    </datalist>
                  </template>
                  <div v-else class="km-readonly-field km-mono">{{ c.requirementValue(req) || c.displayValue(req.default) || 'not set' }}</div>

	                  <div class="km-req-foot">
	                    <span v-if="sourceLabel(req)" class="km-req-src"><Icon icon="tabler:wand" class="km-i-xs" aria-hidden="true" /> {{ sourceLabel(req) }}</span>
	                    <span v-if="c.requirementTypeInvalid(req)" class="km-req-invalid"><Icon icon="tabler:alert-triangle" class="km-i-xs" aria-hidden="true" /> {{ c.requirementTypeHint(req) }}</span>
	                    <span v-else-if="req.invalid" class="km-req-invalid"><Icon icon="tabler:alert-triangle" class="km-i-xs" aria-hidden="true" /> {{ req.invalid_reason || 'invalid value' }}</span>
	                    <span v-if="c.requirementMissing(req) && !c.canAutoFitRequirement(req)" class="km-req-info">
                      <Icon icon="tabler:hand-click" class="km-i-xs" aria-hidden="true" />
                      choose a value to continue
                    </span>
	                    <span v-if="c.requirementReadOnly(req)" class="km-req-info">
                      <Icon icon="tabler:lock" class="km-i-xs" aria-hidden="true" />
                      configured by {{ c.requirementConfiguredBy(req) }}; install it directly to override
                    </span>
                  </div>
                  <div v-if="c.pendingSuggestions.value[requirementKey(req)]" class="km-ai-proposal" role="group" :aria-label="`AI suggestion for ${req.name || requirementKey(req)}`">
                    <div class="km-mono">Suggested value: {{ c.displayValue(c.pendingSuggestions.value[requirementKey(req)].value) }}</div>
                    <p>{{ c.pendingSuggestions.value[requirementKey(req)].choice_reason }}</p>
                    <div class="km-row-gap">
                      <button class="km-btn km-btn-sm" :disabled="!c.planCurrent.value" @click="c.acceptSuggestions([requirementKey(req)])">Accept</button>
                      <button class="km-btn km-btn-secondary km-btn-sm" @click="c.rejectSuggestions([requirementKey(req)])">Reject</button>
                      <button class="km-btn km-btn-secondary km-btn-sm" @click="c.editSuggestions([requirementKey(req)])">Edit</button>
                    </div>
                  </div>
                  <div v-if="req.resolution_error" class="km-msg km-msg-err" role="alert">
                    <span class="km-code">{{ req.resolution_error.kind || req.resolution_error.code }}</span>
                    {{ req.resolution_error.message }}
                    <pre v-if="req.resolution_error.details">{{ JSON.stringify(req.resolution_error.details, null, 2) }}</pre>
                  </div>
                  <div v-if="req.description" class="km-req-desc">{{ req.description }}</div>
                </div>
              </div>
            </template>
          </section>

          <!-- ─────────── Security scan ─────────── -->
          <section v-show="c.activeSection.value === 'scan'" class="km-sec">
            <div class="km-sec-title"><Icon icon="tabler:shield-check" class="km-i km-accent" aria-hidden="true" /> Security scan</div>
            <p class="km-hint">An agent reviews the code of every module being installed. Heuristic, not a guarantee — review flagged items before proceeding.</p>

            <div v-if="c.scan.value.status === 'idle'" class="km-scan-run">
              <Icon icon="tabler:shield-question" class="km-i km-accent" aria-hidden="true" />
              <span class="km-grow">Security scan not run. Running the reviewer may spend LLM tokens.</span>
              <button class="km-btn km-btn-secondary km-btn-outlined km-btn-sm" @click="c.skipScan()">
                <Icon icon="tabler:player-skip-forward" class="km-i" aria-hidden="true" /> Skip scan
              </button>
              <button class="km-btn km-btn-sm" @click="c.runScanNow()">
                <Icon icon="tabler:shield-check" class="km-i" aria-hidden="true" /> Run scan
              </button>
            </div>

            <div v-else-if="c.scan.value.status === 'skipped'" class="km-msg km-msg-info">
              <Icon icon="tabler:shield-off" class="km-i" aria-hidden="true" />
              Security scan skipped. Install can continue without spending reviewer tokens.
              <button class="km-btn km-btn-secondary km-btn-outlined km-btn-sm km-mt" @click="c.runScanNow()"><Icon icon="tabler:shield-check" class="km-i" aria-hidden="true" /> Run scan</button>
            </div>

            <div v-else-if="c.scan.value.status === 'scanning'" class="km-scan-run">
              <Icon icon="tabler:loader-2" class="km-i spin km-accent" aria-hidden="true" />
              <span class="km-grow">Scanning {{ c.scan.value.total || '' }} module{{ c.scan.value.total === 1 ? '' : 's' }}… <span class="km-dim">this can take a moment</span></span>
            </div>

            <div v-else-if="c.scan.value.status === 'clean'" class="km-empty-inline">
              <Icon icon="tabler:shield-check-filled" class="km-i-lg km-sev-ok-fg" aria-hidden="true" />
              <p>No issues found across {{ c.scan.value.scanned }} module{{ c.scan.value.scanned === 1 ? '' : 's' }}.</p>
            </div>

            <div v-else-if="c.scan.value.status === 'error'" class="km-msg km-msg-err">
              Scan failed: {{ c.scan.value.error }}
              <button class="km-btn km-btn-secondary km-btn-outlined km-btn-sm km-mt" @click="c.runScanNow()"><Icon icon="tabler:refresh" class="km-i" aria-hidden="true" /> Retry</button>
            </div>

            <div v-else-if="c.scan.value.status === 'unavailable'" class="km-msg km-msg-info">
              <Icon icon="tabler:shield-off" class="km-i" aria-hidden="true" />
              Security scan unavailable
              <button class="km-btn km-btn-secondary km-btn-outlined km-btn-sm km-mt" @click="c.runScanNow()"><Icon icon="tabler:refresh" class="km-i" aria-hidden="true" /> Retry</button>
            </div>

            <template v-else>
              <p v-if="c.scan.value.summary" class="km-scan-overall">{{ c.scan.value.summary }}</p>
              <div v-if="c.scan.value.status === 'critical'" class="km-msg km-msg-err"><Icon icon="tabler:shield-x" class="km-i" aria-hidden="true" /> Critical findings must be reviewed and confirmed before install.</div>

              <div v-for="m in c.scan.value.modules" :key="m.module" class="km-scan-mod">
                <div class="km-scan-mod-head">
                  <span class="km-dot" :class="modDotClass(m.status)" aria-hidden="true" />
                  <span class="km-mono km-scan-mod-name">{{ m.module }}<template v-if="m.version">@{{ m.version }}</template></span>
                  <span class="km-grow" />
                  <span class="km-chip">{{ m.status }}</span>
                </div>
                <p v-if="m.summary" class="km-scan-mod-sum">{{ m.summary }}</p>

                <div v-for="f in m.findings" :key="f.id" class="km-finding" :class="`km-sev-${findingTone(f)}`">
                  <Icon :icon="SEVERITY_META[f.severity].icon" class="km-i km-finding-icon" aria-hidden="true" />
                  <div class="km-grow km-min0">
                    <div class="km-finding-head"><span class="km-finding-title">{{ f.title }}</span></div>
                    <div v-if="f.detail" class="km-finding-detail">{{ f.detail }}</div>
                    <div v-if="f.location" class="km-finding-loc km-mono">{{ f.location }}</div>
                    <button v-if="f.severity !== 'critical'" class="km-ack" :class="{ done: c.acknowledged.value.has(f.id) }" @click="c.acknowledge(f)">
                      <Icon :icon="c.acknowledged.value.has(f.id) ? 'tabler:check' : 'tabler:eye'" class="km-i-xs" aria-hidden="true" />
                      {{ c.acknowledged.value.has(f.id) ? 'Acknowledged' : 'Acknowledge' }}
                    </button>
                  </div>
                </div>
                <p v-if="!m.findings.length" class="km-dim km-scan-mod-clean">No issues in this module.</p>
              </div>

              <label v-if="c.scan.value.status === 'critical'" class="km-check km-mt">
                <input type="checkbox" v-model="c.criticalConfirmed.value" />
                <span>I understand the critical findings and want to install anyway.</span>
              </label>
            </template>
          </section>

          <!-- ─────────── Review & install ─────────── -->
          <section v-show="c.activeSection.value === 'review'" class="km-sec">
            <div class="km-sec-title"><Icon icon="tabler:checklist" class="km-i km-accent" aria-hidden="true" /> Review &amp; install</div>

            <div class="km-review-grid">
              <div class="km-review-tile"><Icon icon="tabler:package" class="km-i km-accent" aria-hidden="true" /><b>{{ c.moduleCount.value }}</b><span>modules</span></div>
              <div class="km-review-tile"><Icon icon="tabler:adjustments" class="km-i km-accent" aria-hidden="true" /><b>{{ c.boundRequirementCount.value }}/{{ c.requirements.value.length }}</b><span>configured</span></div>
              <div class="km-review-tile"><Icon icon="tabler:database" class="km-i km-accent" aria-hidden="true" /><b>{{ c.migrations.value.length }}</b><span>migrations</span></div>
              <div class="km-review-tile">
                <Icon :icon="c.scan.value.status === 'clean' ? 'tabler:shield-check' : c.scan.value.status === 'critical' ? 'tabler:shield-x' : c.scan.value.status === 'skipped' ? 'tabler:shield-off' : 'tabler:shield'" class="km-i km-accent" aria-hidden="true" />
                <b>{{ c.scan.value.status === 'scanning' ? '…' : c.scan.value.status === 'skipped' || c.scan.value.status === 'idle' ? '—' : c.scan.value.findings.length }}</b><span>scan findings</span>
              </div>
            </div>

            <div class="km-field">
              <label class="km-label">Migration policy</label>
              <PickerSelect
                v-model="c.migrationPolicy.value"
                class="km-sort km-w-full"
                :items="c.migrationOptions.value.map(o => ({ id: o.value, title: o.label }))"
                aria-label="Migration policy"
              />
              <p v-if="c.requiredSetup.value" class="km-hint">This module requires setup. Installation completes after migrations and setup pass verification.</p>
              <div v-if="c.migrations.value.length" class="km-mig-list">
                <div v-for="m in c.migrations.value" :key="m.id" class="km-mig-row">
                  <Icon icon="tabler:database-import" class="km-i-xs km-dim" aria-hidden="true" />
                  <span class="km-mono km-trunc">{{ m.id }}</span>
                  <span class="km-grow" />
                  <span class="km-chip">{{ m.status }}</span>
                </div>
              </div>
              <p class="km-hint"><Icon icon="tabler:shield-lock" class="km-i-xs" aria-hidden="true" /> Changes are transactional — if any step fails, the registry, lock and migrations are rolled back.</p>
            </div>

            <details class="km-adv">
              <summary>Advanced</summary>
              <div class="km-adv-body">
                <div class="km-meta-row"><span>Installs as</span><b class="km-mono">{{ c.destinationId.value || '—' }}</b></div>
                <div class="km-meta-row"><span>Version</span><b class="km-mono">{{ c.versionMode.value === 'pin' ? (c.version.value || 'latest') : '≥ ' + (c.version.value || '0.0.0') }}</b></div>
              </div>
            </details>

            <div v-if="c.result.value" class="km-panel km-panel-ok">
              <div class="km-panel-title">{{ c.result.value.dry_run ? 'Dry-run preview' : 'Applied' }}</div>
              <template v-if="c.result.value.dry_run">
                <div class="km-dim">No changes were applied.</div>
                <div v-if="c.resultExecution.value.length" class="km-dim">{{ c.resultExecution.value.length }} planned step{{ c.resultExecution.value.length === 1 ? '' : 's' }} below.</div>
                <div v-else class="km-dim">Keeper accepted the dry-run but returned no execution details.</div>
              </template>
              <template v-else>
                <div v-if="c.result.value.apply?.stage || c.result.value.operation_id" class="km-dim">
                  <template v-if="c.result.value.apply?.stage">stage: {{ c.result.value.apply.stage }}</template>
                  <template v-if="c.result.value.apply?.stage && c.result.value.operation_id"> · </template>
                  <template v-if="c.result.value.operation_id">op: <code class="km-mono">{{ c.result.value.operation_id }}</code></template>
                </div>
                <div v-else class="km-dim">Changes applied successfully.</div>
                <div v-if="c.result.value.apply?.message" class="km-dim">{{ c.result.value.apply.message }}</div>
              </template>
            </div>

            <div v-if="c.resultExecution.value.length" class="km-ledger">
              <div class="km-panel-title">Execution ledger</div>
              <div v-for="(s, i) in c.resultExecution.value" :key="`${s.step}-${i}`" class="km-ledger-row" :class="ledgerClass(s.status)">
                <span class="km-ledger-step">{{ i + 1 }}</span>
                <span class="km-grow">{{ c.executionStepLabel(s) }}</span>
                <span class="km-chip">{{ s.status }}</span>
                <span v-if="s.message" class="km-ledger-msg">{{ s.message }}</span>
              </div>
            </div>

            <div v-if="c.resultError.value" class="km-msg km-msg-err"><span v-if="c.resultCode.value" class="km-code">{{ c.resultCode.value }}</span>{{ c.resultError.value }}</div>
          </section>
        </div>
      </div>

      <template #footer>
        <div v-if="c.running.value" class="km-running km-2p-progress">
          <Icon icon="tabler:loader-2" class="km-i spin km-accent" aria-hidden="true" />
          <span class="km-grow km-running-label">{{ progressPhaseLabel }}</span>
          <span class="km-dim">{{ c.elapsedSec.value }}s</span>
        </div>
        <template v-else>
          <span v-if="c.blockingSection.value === 'requirements'" class="km-foot-note"><Icon icon="tabler:alert-triangle" class="km-i-sm" aria-hidden="true" /> {{ c.requirementStatusMessage.value }}</span>
          <button v-if="c.blockingSection.value === 'requirements'" class="km-btn km-btn-secondary km-btn-outlined km-btn-sm" :disabled="c.autoFitCount.value === 0" @click="c.autoFitRequirements()">
            <Icon icon="tabler:wand" class="km-i" aria-hidden="true" /> Auto-fit
          </button>
          <span class="km-grow" />
          <button class="km-btn km-btn-text km-btn-secondary km-btn-sm" @click="c.close()">Cancel</button>
          <button class="km-btn km-btn-secondary km-btn-outlined km-btn-sm" :disabled="c.previewDisabled.value" @click="c.preview()">
            <Icon :icon="c.dryRunning.value ? 'tabler:loader-2' : 'tabler:eye'" :class="['km-i', c.dryRunning.value && 'spin']" aria-hidden="true" /> Preview changes
          </button>
          <button class="km-btn km-btn-sm" :disabled="c.primaryDisabled.value" @click="c.primaryAction()">
            <Icon :icon="props.mode === 'update' ? 'tabler:refresh-dot' : 'tabler:download'" class="km-i" aria-hidden="true" /> {{ c.primaryLabel.value }}
          </button>
        </template>
      </template>
  </NativeDialog>
</template>

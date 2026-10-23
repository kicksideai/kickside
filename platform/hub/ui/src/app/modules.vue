<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import AnchoredPanel from '@widgets/app/AnchoredPanel.vue'
import { relativeTime } from '@widgets/app/datetime'
import {
  fmtNum, fmtBytes, formatLicense, moduleAccent, moduleIcon, isAppModule,
  moduleComponent, moduleIsPrivate, moduleLabel, moduleKey, resolvedDependencyVersion,
} from '../lib.ts'
import { useModulesPage } from './useModulesPage.ts'
import InstallDialog from './InstallDialog.vue'
import ModuleDetailView from './ModuleDetailView.vue'

const page = useModulesPage()
const {
  LABEL, HUB_PORTAL, UNINSTALL_MIGRATION_OPTIONS,
  accessDenied, statusBanner,
  hubConnected, hubStatus, hubToken, showTokenPanel, hubConnecting, hubError,
  hubOrgs, hubIdentity, hubTokenStored, hubTokenExpired, hubTokenIcon,
  hubTokenButtonLabel, hubExpiry, saveHubToken, clearHubToken,
  selected, selectedModule, detailReadme, detailLoading, detailTab, detailVersions,
  envVars, requirements, detailGroups, versionMeta, selectedCanUpdate,
  selectedUpdateDisabledReason, selectedCanUninstall, selectedIsPrivate,
  selectedUninstallBlockedReason,
  entryName, entryDesc, entryIcon, openDetail, closeDetail, detailInstall,
  detailUpdate, detailUninstall,
  installed, installedFilter, installedKindFilter, installedTotal,
  updateScanLoading, updateAllRunning, availableUpdates,
  installedLoading, installedError, installedOpen, catalog, catalogLoading, catalogError,
  catalogInstalledTotal, visibleCatalogInstalled,
  browseFilter, sortBy, availableItems, featured, sortedItems, visibleInstalled,
  catalogItemFor, installedAccent, installedIcon, installedIsRoot, installedIsPrivate, installedRole,
  installedUsedBy, installedCanUpdate, installedUpdateDisabledReason,
  installedCanUninstall, installedUninstallDisabledReason, installedMigrationSummary,
  updateInfoForDep, updateStatusLabel, updateStatusIcon, updateStatusBusy,
  scanInstalledUpdates, updateInstalledDependency, updateAllAvailable, refreshAll,
  installTarget, closeInstallDialog, onInstallChanged, openUpdateDialog,
  uninstallDialogOpen, uninstallDep, uninstallPolicy, uninstallRunning,
  uninstallPreviewLoading, uninstallPreview, uninstallExecution, uninstallCode,
  uninstallError, uninstallRequiredBy, uninstallBlockedReason, uninstallActionBlockedReason,
  uninstallPhase, uninstallElapsedSec,
  openUninstallDialog, previewUninstall, executionStepLabel, runUninstall,
} = page

const anchorEl = ref<HTMLElement | null>(null)
</script>

<template>
  <div class="km">
    <div v-if="statusBanner" class="km-banner" :class="statusBanner.kind === 'ok' ? 'km-banner-ok' : 'km-banner-err'">{{ statusBanner.message }}</div>

    <div v-if="accessDenied" class="km-denied">
      <div class="km-denied-box">
        <Icon icon="tabler:lock" class="km-denied-icon" aria-hidden="true" />
        <p class="km-denied-title">Admins only</p>
        <p class="km-denied-sub">You need the <code class="km-mono">app.security:admin</code> scope to manage modules.</p>
      </div>
    </div>

    <div v-else class="km-scroll">
      <!-- ───────────────────────── Detail view — the module page (hub layout) ───────────────────────── -->
      <ModuleDetailView v-if="selected" :page="page" />

      <!-- ───────────────────────── List view ───────────────────────── -->
      <div v-else class="km-list">
        <!-- Discovery: the tagged catalog. The System tab already titles this
             "Modules", so no in-component section title — just the toolbar. -->
        <section>
          <div class="km-sec-bar km-sec-bar-toolbar">
            <div class="km-controls">
              <button class="km-btn km-btn-secondary km-btn-outlined km-btn-sm" :disabled="installedLoading || catalogLoading" @click="refreshAll">
                <Icon :icon="(installedLoading || catalogLoading) ? 'tabler:loader-2' : 'tabler:refresh'" :class="['km-i', (installedLoading || catalogLoading) && 'spin']" aria-hidden="true" /> Refresh
              </button>
              <button class="km-btn km-btn-secondary km-btn-outlined km-btn-sm" :disabled="updateScanLoading || updateAllRunning || installedLoading || installedTotal === 0" @click="scanInstalledUpdates">
                <Icon :icon="updateScanLoading ? 'tabler:loader-2' : 'tabler:refresh-dot'" :class="['km-i', updateScanLoading && 'spin']" aria-hidden="true" /> Scan updates
              </button>
              <button class="km-btn km-btn-sm" :disabled="updateAllRunning || updateScanLoading || availableUpdates.length === 0" @click="updateAllAvailable">
                <Icon :icon="updateAllRunning ? 'tabler:loader-2' : 'tabler:download'" :class="['km-i', updateAllRunning && 'spin']" aria-hidden="true" /> Update all
                <span v-if="availableUpdates.length" class="km-btn-count">{{ availableUpdates.length }}</span>
              </button>
              <input v-model="browseFilter" class="km-input km-filter" placeholder="Filter…" />
              <Select
                v-model="sortBy"
                class="km-sort"
                :options="[
                  { label: 'Top downloads', value: 'downloads' },
                  { label: 'Name A→Z', value: 'name' },
                  { label: 'Recently updated', value: 'recent' },
                ]"
                option-label="label"
                option-value="value"
                aria-label="Sort modules"
              />
              <!-- Manual Hub token: a dropdown to paste/save the registry token. -->
              <div ref="anchorEl" class="km-hub-auth">
                <button
                  class="km-btn km-btn-sm"
                  :class="hubConnected ? 'km-btn-secondary km-btn-outlined' : hubTokenExpired ? 'km-btn-warning km-btn-outlined' : ''"
                  :disabled="hubConnecting"
                  @click="showTokenPanel = !showTokenPanel"
                >
                  <Icon :icon="hubTokenIcon" class="km-i" aria-hidden="true" />
                  {{ hubTokenButtonLabel }}
                  <Icon icon="tabler:chevron-down" class="km-i-sm" aria-hidden="true" />
                </button>
                <AnchoredPanel v-model:open="showTokenPanel" :anchor="anchorEl" align="right" :width="300">
                <div class="km-hub-auth-panel">
                  <div class="km-hub-auth-title">Wippy Hub token</div>

                  <!-- Active token: show who it belongs to and the orgs it grants. -->
                  <div v-if="hubTokenStored" class="km-hub-auth-active" :class="hubTokenExpired && 'is-expired'">
                    <div class="km-hub-auth-row">
                      <Icon :icon="hubTokenExpired ? 'tabler:alert-triangle' : 'tabler:circle-check-filled'" :class="['km-i-sm', hubTokenExpired ? 'km-hub-warn' : 'km-hub-ok']" aria-hidden="true" />
                      <span>{{ hubTokenExpired ? 'Token expired' : 'Token active' }}<template v-if="hubIdentity"> — <strong>{{ hubIdentity }}</strong></template></span>
                    </div>
                    <div v-if="hubStatus?.registry" class="km-hub-auth-meta">{{ hubStatus.registry }}</div>
                    <div class="km-hub-auth-meta">
                      <template v-if="hubStatus?.scope">scope: {{ hubStatus.scope }}</template>
                      <template v-if="hubExpiry"> · expires {{ hubExpiry }}</template>
                    </div>
                    <div v-if="hubOrgs.length" class="km-hub-auth-orgs">
                      <div class="km-hub-auth-orgs-label">Organizations</div>
                      <div v-for="org in hubOrgs" :key="org.id || org.name" class="km-hub-auth-org">
                        <Icon icon="tabler:building" class="km-i-sm" aria-hidden="true" />
                        <span class="km-hub-auth-org-name">{{ org.display_name || org.name }}</span>
                        <span v-if="org.role" class="km-hub-auth-org-role">{{ org.role }}</span>
                      </div>
                    </div>
                  </div>

                  <p class="km-hub-auth-hint">
                    {{ hubTokenStored ? 'Replace the token, or' : 'Paste a Hub registry token to browse and install private modules.' }}
                    <template v-if="hubTokenStored">create a new one</template>
                    <a :href="HUB_PORTAL" target="_blank" rel="noopener">{{ hubTokenStored ? '↗' : 'Create one →' }}</a>
                  </p>
                  <input
                    v-model="hubToken"
                    type="password"
                    class="km-input km-hub-auth-input"
                    placeholder="wpy_…"
                    autocomplete="off"
                    @keyup.enter="saveHubToken"
                  />
                  <div class="km-hub-auth-actions">
                    <button class="km-btn km-btn-sm" :disabled="hubConnecting" @click="saveHubToken">
                      <Icon :icon="hubConnecting ? 'tabler:loader-2' : 'tabler:device-floppy'" :class="['km-i', hubConnecting && 'spin']" aria-hidden="true" />
                      {{ hubConnecting ? 'Saving…' : hubTokenStored ? 'Replace token' : 'Save token' }}
                    </button>
                    <button v-if="hubTokenStored" class="km-btn km-btn-secondary km-btn-outlined km-btn-sm" @click="clearHubToken">
                      <Icon icon="tabler:trash" class="km-i" aria-hidden="true" /> Clear
                    </button>
                  </div>
                </div>
                </AnchoredPanel>
              </div>
            </div>
          </div>

          <div v-if="hubError" class="km-msg km-msg-err">{{ hubError }}</div>

          <div v-if="!hubConnected && hubTokenExpired" class="km-msg">Your Wippy Hub token is expired.</div>

          <div v-if="catalogError" class="km-msg km-msg-err">{{ catalogError }}</div>

          <div v-if="catalogLoading || installedLoading" class="km-loading km-center">
            <Icon icon="tabler:loader-2" class="km-i spin" aria-hidden="true" /> Loading modules…
          </div>

          <template v-else-if="availableItems.length > 0">
            <!-- Most popular -->
            <div v-if="featured.length">
              <div class="hub-section-head">
                <Icon icon="tabler:flame" class="km-i km-flame" aria-hidden="true" />
                <span class="hub-section-title">Most popular</span>
                <span class="hub-section-sub">by downloads</span>
              </div>
              <div class="feat-grid">
                <button v-for="m in featured" :key="'f' + moduleKey(m)" class="feat-card" :style="{ '--accent': moduleAccent(m) }" @click="openDetail(m)">
                  <span class="feat-strip" />
                  <span class="feat-icon"><Icon :icon="moduleIcon(m)" class="km-i-lg" aria-hidden="true" /></span>
                  <span class="feat-body">
                    <span class="km-row-wrap">
                      <span class="feat-name">{{ moduleLabel(m) }}</span>
                      <span v-if="isAppModule(m)" class="badge-app kx-tag-caps">app</span>
                      <span v-if="moduleIsPrivate(m)" class="badge-private kx-tag-caps" title="Private Hub module"><Icon icon="tabler:lock" class="km-i-xs" aria-hidden="true" /> private</span>
                      <span v-if="m.deprecated" class="badge-warn kx-tag-caps">deprecated</span>
                    </span>
                    <span class="feat-org">{{ moduleComponent(m) }}</span>
                    <span v-if="m.description" class="feat-desc">{{ m.description }}</span>
                    <span class="feat-meta">
                      <span class="meta-pill"><Icon icon="tabler:tag" class="km-i-xs" aria-hidden="true" /> {{ m.latest_version || '?' }}</span>
                      <span class="meta-pill"><Icon icon="tabler:download" class="km-i-xs" aria-hidden="true" /> {{ fmtNum(m.total_downloads) }}</span>
                      <span v-if="m.license" class="meta-pill" :title="m.license"><Icon icon="tabler:license" class="km-i-xs" aria-hidden="true" /> {{ formatLicense(m.license) }}</span>
                    </span>
                  </span>
                </button>
              </div>
            </div>

            <!-- All available (always headed, so the grid never sits flush under
                 the toolbar and the count is always visible). -->
            <div :class="featured.length ? 'km-mt-sm' : ''">
              <div class="hub-section-head">
                <Icon icon="tabler:apps" class="km-i km-accent" aria-hidden="true" />
                <span class="hub-section-title">{{ featured.length ? 'All modules' : 'Available' }}</span>
                <span class="hub-section-sub">{{ availableItems.length }} available</span>
              </div>
              <div class="mod-grid">
                <button v-for="m in sortedItems" :key="moduleKey(m)" class="mod-card" :style="{ '--accent': moduleAccent(m) }" @click="openDetail(m)">
                  <span class="mod-icon"><Icon :icon="moduleIcon(m)" class="km-i" aria-hidden="true" /></span>
                  <span class="mod-body">
                    <span class="km-row-wrap">
                      <span class="mod-name">{{ moduleLabel(m) }}</span>
                      <span class="mod-version">{{ m.latest_version || '—' }}</span>
                      <span v-if="isAppModule(m)" class="badge-app kx-tag-caps">app</span>
                      <span v-if="moduleIsPrivate(m)" class="badge-private kx-tag-caps" title="Private Hub module"><Icon icon="tabler:lock" class="km-i-xs" aria-hidden="true" /> private</span>
                      <span v-if="m.deprecated" class="badge-warn kx-tag-caps">deprecated</span>
                    </span>
                    <span class="mod-org">{{ moduleComponent(m) }}</span>
                    <span v-if="m.description" class="mod-desc">{{ m.description }}</span>
                    <span class="mod-foot">
                      <span class="foot-stat"><Icon icon="tabler:download" class="km-i-xs" aria-hidden="true" /> {{ fmtNum(m.total_downloads) }}</span>
                      <span v-if="m.favorites_count" class="foot-stat"><Icon icon="tabler:star" class="km-i-xs" aria-hidden="true" /> {{ m.favorites_count }}</span>
                      <span v-if="m.license" class="foot-stat km-dim" :title="m.license">{{ formatLicense(m.license) }}</span>
                      <span v-if="m.update_time" class="foot-stat km-dim km-ml-auto">{{ relativeTime(m.update_time, { maxUnit: 'year' }) }}</span>
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </template>

          <div v-else-if="!catalogError && catalog.length === 0" class="km-empty">
            <Icon icon="tabler:package-off" class="km-i-xl km-dim km-block" aria-hidden="true" />
            <p class="km-muted">
              No modules tagged <code class="km-mono">{{ LABEL }}</code> are published yet.
            </p>
          </div>
          <div v-else-if="!catalogError && browseFilter" class="km-empty">
            <p class="km-muted">No available modules match this filter.</p>
          </div>
          <div v-else-if="!catalogError" class="km-empty">
            <Icon icon="tabler:circle-check" class="km-i-xl km-dim km-block" aria-hidden="true" />
            <p class="km-muted">
              All <code class="km-mono">{{ LABEL }}</code> modules are installed — manage them under Installed below.
            </p>
          </div>
        </section>

        <!-- Installed modules stay out of discovery, but remain immediately visible. -->
        <section v-if="installed.length > 0 || installedError" class="km-installed">
          <button class="km-collapse-head" :aria-expanded="installedOpen" @click="installedOpen = !installedOpen">
            <Icon :icon="installedOpen ? 'tabler:chevron-down' : 'tabler:chevron-right'" class="km-i" aria-hidden="true" />
            <span class="km-h2">Installed</span>
            <span class="km-sub">
              {{ visibleInstalled.length }}<template v-if="visibleInstalled.length !== installedTotal"> of {{ installedTotal }}</template>
              module{{ visibleInstalled.length === 1 ? '' : 's' }}
            </span>
            <span v-if="catalogInstalledTotal > 0 && catalogInstalledTotal !== installedTotal" class="km-update-count">
              {{ visibleCatalogInstalled }} of {{ catalogInstalledTotal }} hub module{{ catalogInstalledTotal === 1 ? '' : 's' }}
            </span>
            <span v-if="availableUpdates.length" class="km-update-count">{{ availableUpdates.length }} update{{ availableUpdates.length === 1 ? '' : 's' }}</span>
          </button>

          <template v-if="installedOpen">
            <div v-if="installedError" class="km-msg km-msg-err km-mb">{{ installedError }}</div>

            <div v-if="installed.length > 0" class="inst-toolbar">
              <input v-model="installedFilter" class="km-input km-filter inst-filter" placeholder="Search installed…" aria-label="Search installed modules" />
              <Select
                v-model="installedKindFilter"
                class="km-sort"
                :options="[
                  { label: 'All installed', value: 'all' },
                  { label: 'Root only', value: 'root' },
                  { label: 'Transitive only', value: 'transitive' },
                  { label: 'Local replacements', value: 'local' },
                ]"
                option-label="label"
                option-value="value"
                aria-label="Filter installed modules"
              />
            </div>

            <div v-if="visibleInstalled.length > 0" class="inst-list">
              <button
                v-for="dep in visibleInstalled"
                :key="dep.id"
                class="inst-row"
                :style="{ '--accent': installedAccent(dep) }"
                @click="openDetail(dep)"
              >
                <span class="inst-strip" aria-hidden="true" />
                <div class="inst-icon">
                  <Icon :icon="installedIcon(dep)" class="km-i" aria-hidden="true" />
                </div>
                <div class="km-grow km-min0">
                  <div class="km-row-tight">
                    <span class="inst-name">{{ dep.component }}</span>
                    <span v-if="isAppModule(catalogItemFor(dep.component))" class="badge-app kx-tag-caps">app</span>
                    <span :class="installedIsRoot(dep) ? 'badge-installed kx-tag-caps' : 'km-chip'">{{ installedRole(dep) }}</span>
                    <span v-if="installedIsPrivate(dep)" class="badge-private kx-tag-caps" title="Private Hub module"><Icon icon="tabler:lock" class="km-i-xs" aria-hidden="true" /> private</span>
                    <span v-if="dep.source" class="km-chip">{{ dep.source }}</span>
                    <span
                      v-if="updateInfoForDep(dep) && updateInfoForDep(dep)?.status !== 'current'"
                      class="inst-update"
                      :class="updateInfoForDep(dep)?.status"
                      :title="updateInfoForDep(dep)?.message || ''"
                    >
                      <Icon :icon="updateStatusIcon(dep)" :class="['km-i-xs', updateStatusBusy(dep) && 'spin']" aria-hidden="true" />
                      {{ updateStatusLabel(dep) }}
                    </span>
                  </div>
                  <div class="inst-id">
                    {{ dep.id }}
                    <span v-if="installedUsedBy(dep)" class="km-dim"> · {{ installedUsedBy(dep) }}</span>
                  </div>
                  <div v-if="updateInfoForDep(dep)?.message" class="inst-update-msg">{{ updateInfoForDep(dep)?.message }}</div>
                </div>
                <span class="inst-ver">{{ resolvedDependencyVersion(dep) }}</span>
                <span class="inst-migs">{{ installedMigrationSummary(dep) }}</span>
                <div class="inst-actions">
                  <button
                    v-if="updateInfoForDep(dep)?.status === 'available' || updateStatusBusy(dep)"
                    class="km-icon-btn"
                    :disabled="updateStatusBusy(dep) || updateAllRunning"
                    :aria-label="`Update ${dep.component}`"
                    @click.stop="updateInstalledDependency(dep)"
                  >
                    <Icon :icon="updateStatusIcon(dep)" :class="['km-i', updateStatusBusy(dep) && 'spin']" aria-hidden="true" />
                  </button>
                  <button v-else-if="installedCanUpdate(dep)" class="km-icon-btn" :aria-label="`Open update planner for ${dep.component}`" @click.stop="openUpdateDialog(dep)"><Icon icon="tabler:refresh-dot" class="km-i" aria-hidden="true" /></button>
                  <button v-else class="km-icon-btn" disabled :title="installedUpdateDisabledReason(dep)" :aria-label="`Cannot update ${dep.component}: ${installedUpdateDisabledReason(dep)}`"><Icon icon="tabler:refresh-off" class="km-i" aria-hidden="true" /></button>
                  <button v-if="installedCanUninstall(dep)" class="km-icon-btn km-danger" :aria-label="`Uninstall ${dep.component}`" @click.stop="openUninstallDialog(dep)"><Icon icon="tabler:trash" class="km-i" aria-hidden="true" /></button>
                  <button v-else class="km-icon-btn" disabled :title="installedUninstallDisabledReason(dep)" :aria-label="`Cannot uninstall ${dep.component}: ${installedUninstallDisabledReason(dep)}`"><Icon icon="tabler:trash-off" class="km-i" aria-hidden="true" /></button>
                </div>
                <Icon icon="tabler:chevron-right" class="km-i km-chev" aria-hidden="true" />
              </button>
            </div>
            <div v-else-if="installed.length > 0" class="km-empty inst-empty">
              <Icon icon="tabler:filter-off" class="km-i-xl km-dim km-block" aria-hidden="true" />
              <p class="km-muted">No installed modules match this filter.</p>
            </div>
          </template>
        </section>
      </div>
    </div>

    <!-- Install / Update dialog (two-pane: sections + live status) -->
    <InstallDialog
      v-if="installTarget"
      :open="true"
      :mode="installTarget.mode"
      :component="installTarget.component"
      :version="installTarget.version"
      :current-id="installTarget.currentId"
      :catalog-item="installTarget.catalogItem"
      :installed-dep="installTarget.installedDep"
      @close="closeInstallDialog"
      @changed="onInstallChanged"
    />

    <!-- Uninstall dialog -->
    <Dialog
      v-model:visible="uninstallDialogOpen"
      modal
      :closable="!uninstallRunning"
      :dismissable-mask="!uninstallRunning"
      :close-on-escape="!uninstallRunning"
      class="km-dialog"
      :pt="{ header: { class: 'km-modal-head' }, content: { class: 'km-dialog-content' }, footer: { class: 'km-modal-foot' } }"
      :style="{ width: 'min(560px, calc(100vw - 40px))' }"
    >
        <template #header><span>Uninstall module</span></template>

        <div class="km-modal-body">
          <p class="km-uninstall-target">
            Uninstall <code class="km-mono">{{ uninstallDep?.component }}</code>
            <span class="km-dim">({{ uninstallDep?.id }})</span>
          </p>

          <div>
            <label class="km-label">Migration policy</label>
            <Select
              v-model="uninstallPolicy"
              class="km-sort km-w-full"
              :options="UNINSTALL_MIGRATION_OPTIONS"
              option-label="label"
              option-value="value"
              aria-label="Uninstall migration policy"
            />
            <p class="km-req-desc">Default <code class="km-mono">block</code>. Choose <code class="km-mono">down</code> only if the module's down migrations are safe; data loss is possible.</p>
          </div>

          <div v-if="uninstallError" class="km-msg km-msg-err">
            <span v-if="uninstallCode" class="km-code">{{ uninstallCode }}</span>{{ uninstallError }}
            <div v-if="uninstallRequiredBy.length" class="km-mt">required by: {{ uninstallRequiredBy.join(', ') }}</div>
          </div>
          <div v-if="uninstallBlockedReason" class="km-msg km-msg-info">
            <strong>Uninstall blocked:</strong> {{ uninstallBlockedReason }}
          </div>

          <div v-if="uninstallPreviewLoading" class="km-running">
            <Icon icon="tabler:loader-2" class="km-i spin km-accent" aria-hidden="true" />
            <span class="km-grow km-running-label">Previewing uninstall</span>
          </div>

          <div v-else-if="uninstallPreview" class="km-uninstall-preview">
            <div v-if="uninstallPreview.warnings?.length" class="km-msg">
              <div v-for="w in uninstallPreview.warnings" :key="w">{{ w }}</div>
            </div>
            <div v-if="uninstallPreview.removed?.length" class="km-preview-block">
              <div class="km-preview-title">Removed</div>
              <div v-for="r in uninstallPreview.removed" :key="r.name || r.component" class="km-preview-row">
                <Icon icon="tabler:minus" class="km-i-xs km-danger-fg" aria-hidden="true" />
                <span class="km-mono">{{ r.name || r.component }}</span>
                <span class="km-grow" />
                <span class="km-dim">{{ r.version }}</span>
              </div>
            </div>
            <div v-if="uninstallPreview.kept?.length" class="km-preview-block">
              <div class="km-preview-title">Kept, still needed</div>
              <div v-for="k in uninstallPreview.kept" :key="k.name || k.component" class="km-preview-row">
                <Icon icon="tabler:lock" class="km-i-xs km-dim" aria-hidden="true" />
                <span class="km-mono">{{ k.name || k.component }}</span>
                <span class="km-grow" />
                <span class="km-dim">{{ k.version }}</span>
              </div>
            </div>
            <div v-if="uninstallPreview.kept_under_uncertainty?.length" class="km-preview-block">
              <div class="km-preview-title">Kept under uncertainty</div>
              <div v-for="k in uninstallPreview.kept_under_uncertainty" :key="k.name || k.component" class="km-preview-row">
                <Icon icon="tabler:help" class="km-i-xs km-dim" aria-hidden="true" />
                <span class="km-mono">{{ k.name || k.component }}</span>
                <span class="km-grow" />
                <span class="km-dim">{{ k.reason || k.version }}</span>
              </div>
            </div>
          </div>

          <div v-if="uninstallExecution.length" class="km-ledger">
            <div class="km-panel-title">Execution ledger</div>
            <div v-for="(s, i) in uninstallExecution" :key="`${s.step}-${i}`" class="km-ledger-row" :class="s.status === 'failed' || s.status === 'rollback_failed' ? 'km-ledger-bad' : s.status === 'rolled_back' ? 'km-ledger-warn' : 'km-ledger-ok'">
              <span class="km-ledger-step">{{ i + 1 }}</span>
              <span class="km-grow">{{ executionStepLabel(s) }}</span>
              <span class="km-chip">{{ s.status }}</span>
              <span v-if="s.message" class="km-ledger-msg">{{ s.message }}</span>
            </div>
          </div>

          <div v-if="uninstallRunning" class="km-running">
            <Icon icon="tabler:loader-2" class="km-i spin km-accent" aria-hidden="true" />
            <span class="km-grow km-running-label">{{ uninstallPhase }}</span>
            <span class="km-dim">{{ uninstallElapsedSec }}s</span>
          </div>
        </div>

        <template #footer>
          <button class="km-btn km-btn-text km-btn-secondary km-btn-sm" :disabled="uninstallRunning" @click="uninstallDialogOpen = false">Cancel</button>
          <button class="km-btn km-btn-secondary km-btn-outlined km-btn-sm" :disabled="uninstallRunning || uninstallPreviewLoading" @click="previewUninstall">
            <Icon :icon="uninstallPreviewLoading ? 'tabler:loader-2' : 'tabler:eye'" :class="['km-i', uninstallPreviewLoading && 'spin']" aria-hidden="true" /> Preview
          </button>
          <button class="km-btn km-btn-danger km-btn-sm" :disabled="!!uninstallActionBlockedReason" :title="uninstallActionBlockedReason || undefined" @click="runUninstall">
            <Icon :icon="uninstallRunning ? 'tabler:loader-2' : 'tabler:trash'" :class="['km-i', uninstallRunning && 'spin']" aria-hidden="true" /> Uninstall
          </button>
        </template>
    </Dialog>
  </div>
</template>

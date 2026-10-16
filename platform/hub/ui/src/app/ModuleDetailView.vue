<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { relativeTime } from '@widgets/app/datetime'
import { fmtNum, fmtBytes, moduleAccent, moduleIcon, isAppModule } from '../lib.ts'
import type { useModulesPage } from './useModulesPage.ts'

type ModulesPageState = ReturnType<typeof useModulesPage>
const props = defineProps<{ page: ModulesPageState }>()
const {
  selectedModule, selectedIsPrivate, selectedCanUpdate, selectedUpdateDisabledReason,
  selectedCanUninstall, selectedUninstallBlockedReason, detailUpdate, detailUninstall, detailInstall,
  closeDetail, versionMeta, detailTab, detailReadme, detailLoading, detailVersions, envVars,
  requirements, entryIcon, entryName, entryDesc, detailGroups,
} = props.page
const selected = computed(() => props.page.selected.value!)
</script>

<template>
  <div class="d-page" :style="{ '--accent': selectedModule ? moduleAccent(selectedModule) : 'var(--p-primary-color)' }">
        <button class="d-back" @click="closeDetail">
          <Icon icon="tabler:arrow-left" class="km-i-sm" aria-hidden="true" /> Back to modules
        </button>

        <!-- Hero -->
        <header class="d-hero">
          <div class="d-hero-icon"><Icon :icon="selectedModule ? moduleIcon(selectedModule) : 'tabler:package'" class="km-i-lg" aria-hidden="true" /></div>
          <div class="km-grow km-min0">
            <div class="km-row-wrap">
              <h2 class="d-hero-name">{{ selected.label }}</h2>
              <span class="d-ver">{{ selected.version || '—' }}</span>
              <span v-if="isAppModule(selectedModule)" class="badge-app kx-tag-caps">app</span>
              <span v-if="selected.installed" class="badge-installed kx-tag-caps">installed</span>
              <span v-if="selectedIsPrivate" class="badge-private kx-tag-caps" title="Private Hub module"><Icon icon="tabler:lock" class="km-i-xs" aria-hidden="true" /> private</span>
              <span v-if="selectedModule?.deprecated" class="badge-warn kx-tag-caps">deprecated</span>
            </div>
            <div class="d-hero-org">{{ selected.component }}</div>
            <p v-if="selected.description" class="d-hero-desc">{{ selected.description }}</p>
            <div class="d-hero-actions">
              <template v-if="selected.installed">
                <button v-if="selectedCanUpdate" class="km-btn km-btn-secondary km-btn-outlined km-btn-sm" @click="detailUpdate">
                  <Icon icon="tabler:refresh-dot" class="km-i" aria-hidden="true" /> Update
                </button>
                <button v-else class="km-btn km-btn-secondary km-btn-outlined km-btn-sm" disabled :title="selectedUpdateDisabledReason || undefined">
                  <Icon icon="tabler:refresh-off" class="km-i" aria-hidden="true" /> Update
                </button>
                <button v-if="selectedCanUninstall" class="km-btn km-btn-text km-btn-danger km-btn-sm" @click="detailUninstall">
                  <Icon icon="tabler:trash" class="km-i" aria-hidden="true" /> Uninstall
                </button>
                <button v-else-if="selectedUninstallBlockedReason" class="km-btn km-btn-text km-btn-danger km-btn-sm" disabled :title="selectedUninstallBlockedReason">
                  <Icon icon="tabler:trash-off" class="km-i" aria-hidden="true" /> Uninstall
                </button>
              </template>
              <button v-else class="km-btn km-btn-sm" @click="detailInstall">
                <Icon icon="tabler:download" class="km-i" aria-hidden="true" /> Install
              </button>
              <a v-if="selectedModule?.repository" :href="String(selectedModule.repository)" target="_blank" rel="noopener" class="d-link"><Icon icon="tabler:brand-github" class="km-i-sm" aria-hidden="true" /> Repository</a>
              <a v-if="selectedModule?.homepage" :href="String(selectedModule.homepage)" target="_blank" rel="noopener" class="d-link"><Icon icon="tabler:home" class="km-i-sm" aria-hidden="true" /> Homepage</a>
            </div>
          </div>
        </header>

        <div class="d-grid">
          <!-- Sidebar: meta + the highlighted env / requires -->
          <aside class="d-side">
            <section class="d-block">
              <div class="d-row"><Icon icon="tabler:download" class="d-row-i" aria-hidden="true" /><span class="d-row-k">Downloads</span><span class="d-row-v">{{ fmtNum(selectedModule?.total_downloads) }}</span></div>
              <div v-if="selectedModule?.favorites_count" class="d-row"><Icon icon="tabler:star" class="d-row-i" aria-hidden="true" /><span class="d-row-k">Favorites</span><span class="d-row-v">{{ selectedModule.favorites_count }}</span></div>
              <div v-if="selectedModule?.license" class="d-row"><Icon icon="tabler:license" class="d-row-i" aria-hidden="true" /><span class="d-row-k">License</span><span class="d-row-v">{{ selectedModule.license }}</span></div>
              <div v-if="selectedModule?.type" class="d-row"><Icon icon="tabler:category" class="d-row-i" aria-hidden="true" /><span class="d-row-k">Type</span><span class="d-row-v">{{ selectedModule.type }}</span></div>
              <div v-if="selectedIsPrivate" class="d-row"><Icon icon="tabler:lock" class="d-row-i" aria-hidden="true" /><span class="d-row-k">Visibility</span><span class="d-row-v">Private</span></div>
              <div v-if="selectedModule?.update_time" class="d-row"><Icon icon="tabler:clock" class="d-row-i" aria-hidden="true" /><span class="d-row-k">Updated</span><span class="d-row-v">{{ relativeTime(selectedModule.update_time, { maxUnit: 'year' }) }}</span></div>
              <div v-if="versionMeta?.entry_count" class="d-row"><Icon icon="tabler:list-numbers" class="d-row-i" aria-hidden="true" /><span class="d-row-k">Entries</span><span class="d-row-v">{{ versionMeta.entry_count }}</span></div>
              <div v-if="versionMeta?.size_bytes" class="d-row"><Icon icon="tabler:weight" class="d-row-i" aria-hidden="true" /><span class="d-row-k">Size</span><span class="d-row-v">{{ fmtBytes(versionMeta.size_bytes) }}</span></div>
            </section>

            <section v-if="(selectedModule?.keywords || []).length" class="d-block">
              <div class="d-block-title">Keywords</div>
              <div class="km-pills">
                <span v-for="k in selectedModule!.keywords" :key="k" class="provides-pill">{{ k }}</span>
              </div>
            </section>

            <!-- Hub-declared dependencies / requirements (available without install) -->
            <section v-if="(versionMeta?.dependencies || []).length" class="d-block">
              <div class="d-block-title">Dependencies</div>
              <div class="km-dep-list">
                <div v-for="(d, i) in versionMeta!.dependencies" :key="i" class="km-dep">
                  <span class="km-trunc">{{ d.org }}/{{ d.name }}</span>
                  <span class="km-dim">{{ d.version_constraint }}</span>
                </div>
              </div>
            </section>

            <section v-if="(versionMeta?.lua_modules || []).length" class="d-block">
              <div class="d-block-title">Lua modules</div>
              <div class="km-pills">
                <span v-for="m in versionMeta!.lua_modules" :key="m" class="provides-pill">{{ m }}</span>
              </div>
            </section>
          </aside>

          <!-- Main: tabbed content (Readme first) -->
          <main class="d-main">
            <div class="d-tabs">
              <button class="d-tab" :class="{ active: detailTab === 'readme' }" :disabled="!detailReadme && !detailLoading" @click="detailTab = 'readme'">Readme</button>
              <button class="d-tab" :class="{ active: detailTab === 'overview' }" @click="detailTab = 'overview'">Overview</button>
              <button class="d-tab" :class="{ active: detailTab === 'versions' }" @click="detailTab = 'versions'">Versions <span v-if="detailVersions.length" class="km-dim">{{ detailVersions.length }}</span></button>
            </div>

            <div class="d-tab-body">
              <div v-if="detailLoading" class="km-loading">
                <Icon icon="tabler:loader-2" class="km-i spin" aria-hidden="true" /> Loading…
              </div>

              <!-- Readme -->
              <template v-else-if="detailTab === 'readme'">
                <div v-if="!detailReadme" class="d-empty">
                  <Icon icon="tabler:file-off" class="km-i-xl km-dim" aria-hidden="true" />
                  <p class="km-mt">No README provided.</p>
                </div>
                <article v-else class="rm">
                  <wc-render-markdown :source="detailReadme"></wc-render-markdown>
                </article>
              </template>

              <!-- Overview: environment, requirements, and provided entries -->
              <template v-else-if="detailTab === 'overview'">
                <div class="km-stack-lg">
                  <!-- Environment variables — the config knobs -->
                  <section v-if="envVars.length">
                    <div class="d-block-title d-accent"><Icon icon="tabler:settings-2" class="km-i-sm" aria-hidden="true" /> Environment <span class="km-dim">{{ envVars.length }}</span></div>
                    <p class="d-sub">Variables this module reads — set them in your environment.</p>
                    <div class="km-2col">
                      <div v-for="e in envVars" :key="e.id" class="d-field d-field-env">
                        <span class="d-field-i"><Icon :icon="entryIcon(e, 'tabler:variable')" class="km-i" aria-hidden="true" /></span>
                        <span class="km-grow km-min0">
                          <span class="d-cfg-name">{{ entryName(e) }}</span>
                          <span v-if="entryDesc(e)" class="d-cfg-desc">{{ entryDesc(e) }}</span>
                        </span>
                      </div>
                    </div>
                  </section>

                  <!-- Requirements wired at install -->
                  <section v-if="requirements.length || (versionMeta?.requirements || []).length">
                    <div class="d-block-title"><Icon icon="tabler:plug-connected" class="km-i-sm" aria-hidden="true" /> Requires</div>
                    <p class="d-sub">Host resources this module is wired to at install.</p>
                    <div class="km-2col">
                      <template v-if="requirements.length">
                        <div v-for="e in requirements" :key="e.id" class="d-field d-field-req">
                          <span class="d-field-i d-field-i-req"><Icon icon="tabler:link" class="km-i" aria-hidden="true" /></span>
                          <span class="km-grow km-min0">
                            <span class="d-cfg-name">{{ entryName(e) }}</span>
                            <span v-if="entryDesc(e)" class="d-cfg-desc">{{ entryDesc(e) }}</span>
                          </span>
                        </div>
                      </template>
                      <template v-else>
                        <div v-for="(r, i) in versionMeta!.requirements" :key="i" class="d-field d-field-req">
                          <span class="d-field-i d-field-i-req"><Icon icon="tabler:link" class="km-i" aria-hidden="true" /></span>
                          <span class="km-grow km-min0">
                            <span class="d-cfg-name">{{ r.name }}</span>
                            <span v-if="r.description" class="d-cfg-desc">{{ r.description }}</span>
                            <span v-if="r.default" class="d-cfg-desc km-mono">default: {{ r.default }}</span>
                          </span>
                        </div>
                      </template>
                    </div>
                  </section>

                  <!-- Provided entries -->
                  <section>
                    <div class="d-block-title"><Icon icon="tabler:package" class="km-i-sm d-accent-i" aria-hidden="true" /> Provides</div>
                    <div v-if="!selected.installed">
                      <template v-if="(versionMeta?.entry_kinds || []).length">
                        <p class="d-sub">Publishes {{ versionMeta!.entry_count || versionMeta!.entry_kinds!.length }} entries; per-entry detail resolves after install.</p>
                        <div class="km-pills">
                          <span v-for="k in versionMeta!.entry_kinds" :key="k" class="provides-pill">{{ k }}</span>
                        </div>
                      </template>
                      <p v-else class="km-muted">See the <strong>Readme</strong> tab for details.</p>
                    </div>
                    <p v-else-if="!detailGroups.length" class="km-muted">No registry entries.</p>
                    <div v-else class="km-stack">
                      <div v-for="g in detailGroups" :key="g.key">
                        <div class="km-group-head"><Icon :icon="g.icon" class="km-i-sm d-accent-i" aria-hidden="true" /> {{ g.label }} <span class="km-dim">{{ g.items.length }}</span></div>
                        <div class="km-2col">
                          <div v-for="e in g.items" :key="e.id" class="d-entry">
                            <div class="d-entry-name">{{ (e.meta && e.meta.title) || entryName(e) }}</div>
                            <div class="d-entry-id">{{ e.id }}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </template>

              <!-- Versions -->
              <template v-else>
                <p v-if="!detailVersions.length" class="km-muted">No published versions.</p>
                <div v-else class="d-vers">
                  <div v-for="v in detailVersions" :key="v.version" class="d-ver-row">
                    <span class="d-ver-tag">{{ v.version }}</span>
                    <span v-if="v.create_time" class="km-dim">{{ relativeTime(v.create_time, { maxUnit: 'year' }) }}</span>
                    <span class="km-grow" />
                    <span v-if="v.download_count" class="km-dim km-inline"><Icon icon="tabler:download" class="km-i-xs" aria-hidden="true" /> {{ fmtNum(v.download_count) }}</span>
                    <span v-if="v.size_bytes" class="km-dim">{{ fmtBytes(v.size_bytes) }}</span>
                  </div>
                </div>
              </template>
            </div>
          </main>
        </div>
      </div>
</template>

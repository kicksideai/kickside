<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { api } from '@wippy-fe/proxy'
import { useComponentEvents } from '../constants.ts'
import { useOnboardingInstallQueue } from './useOnboardingInstallQueue.ts'
import { useOnboardingCatalog } from './useOnboardingCatalog.ts'
import { useOnboardingRecommendationEngine } from './useOnboardingRecommendationEngine.ts'
import {
  keeperHub,
} from '../keeper-hub.ts'
import {
  moduleAccent,
  moduleComponent,
  moduleIcon,
  moduleIsPrivate,
  moduleLabel,
} from '../lib.ts'
import type { OnboardingProfile } from '../onboardingProfiles.ts'

const emit = useComponentEvents()
const hub = keeperHub(api)

const prompt = ref('')
const browseQuery = ref('')
const customMode = ref(false)
const customMethod = ref<'recommend' | 'browse'>('recommend')

const catalogState = useOnboardingCatalog({ hub, prompt, browseQuery, initializeProfileSelection })
const {
  loading, error, profileError, profiles, selectedProfileIds, candidates, installed,
  installedDependencies, installedModules, organizations, installedCount,
  tokens, browseTokens, available, selectableCandidates, catalogGroups, matchingGroups,
  browseGroups, browseResultCount, workspaceComponents, availableComponentIds,
  selectedProfiles, requiredProfiles, optionalProfiles, optionalProfileCount,
  apiMessage, candidateKey, candidateById, queuedLabel, profilePackageLabels, profileParameters,
  mergeCandidates, loadInstalled, loadPrivateOrganizations, loadProfiles, loadProfileCandidates,
  load, profileSelection, profileUsable,
} = catalogState


const installQueue = useOnboardingInstallQueue({
  hub,
  installed,
  installedCount,
  error,
  selectableCandidates: () => selectableCandidates.value,
  candidateKey,
  candidateById,
  queuedLabel,
  profileParameters,
  loadInstalled,
  apiMessage,
})
const {
  queue, advancing, queueCompleted, queueTotal, queueLedger,
  toggleQueued, addQueued, isQueued, resetRunProgress, startQueue,
} = installQueue
const recommendationEngine = useOnboardingRecommendationEngine({
  hub, emit, prompt, tokens, catalogGroups, matchingGroups, workspaceComponents,
  mergeCandidates, addQueued, apiMessage, error,
})
const { searching, recommendationNotice, recommend, matchCatalog } = recommendationEngine
const queueTerminal = computed(() => !advancing.value && queue.value.length === 0)
const queueHasFailures = computed(() => queueLedger.value.some(item => item.status === 'failed'))
const queueHeading = computed(() => {
  if (advancing.value) return 'Installing packages'
  if (queueHasFailures.value) return 'Some packages need attention'
  if (queueTotal.value) return 'Packages installed'
  return 'Selected packages'
})
const queueActionLabel = computed(() => queueHasFailures.value ? 'Retry failed' : 'Install selected')
const canContinue = computed(() => !loading.value && !error.value && queueTerminal.value
  && (customMode.value || selectedProfiles.value.length > 0))
const queuePercent = computed(() => queueTotal.value
  ? Math.round((queueCompleted.value / queueTotal.value) * 100)
  : 0)
const continueLabel = computed(() => {
  if (advancing.value) return 'Installation in progress…'
  if (queue.value.length) return 'Install selected packages first'
  if (selectedProfiles.value.length) return 'Continue with this setup ›'
  if (customMode.value) return installedCount.value ? 'Continue ›' : 'Continue without installing ›'
  return 'Choose capability bundles'
})

function selectedProfileQueue(): string[] {
  const result: string[] = []
  const seen = new Set<string>()
  for (const profile of selectedProfiles.value) {
    for (const pkg of profileSelection(profile).selected) {
      const module = candidateById(pkg.component)
      const component = module ? moduleComponent(module).trim() : pkg.component
      const key = component.toLowerCase()
      if (!component || seen.has(key)) continue
      seen.add(key)
      result.push(component)
    }
  }
  return result
}

function syncProfileQueue() {
  queue.value = selectedProfileQueue()
  resetRunProgress()
}

function initializeProfileSelection() {
  const required = profiles.value.filter(profile => profile.required && profileUsable(profile)).map(profile => profile.id)
  selectedProfileIds.value = new Set(required)
  syncProfileQueue()
}

function chooseProfile(profile: OnboardingProfile) {
  if (advancing.value || !profileUsable(profile)) return
  customMode.value = false
  if (profile.required) return
  const next = new Set(selectedProfileIds.value)
  if (next.has(profile.id)) next.delete(profile.id)
  else next.add(profile.id)
  selectedProfileIds.value = next
  syncProfileQueue()
}

function chooseCustom(method: 'recommend' | 'browse') {
  if (advancing.value) return
  customMode.value = true
  customMethod.value = method
  recommendationNotice.value = null
  selectedProfileIds.value = new Set(profiles.value.filter(profile => profile.required).map(profile => profile.id))
  syncProfileQueue()
}

function backToProfiles() {
  if (advancing.value) return
  customMode.value = false
  recommendationNotice.value = null
  syncProfileQueue()
}

function navigateBack() {
  if (customMode.value) backToProfiles()
  else emit('back', undefined)
}

function finishOnboarding() {
  if (!canContinue.value) return
  const skipped = customMode.value && installedCount.value === 0
  const profileIds = selectedProfiles.value.map(profile => profile.id)
  emit('done', {
    status: skipped ? 'skipped' : 'completed',
    installed_count: installedCount.value,
    ...(profileIds.length === 1 ? { profile: profileIds[0] } : {}),
    ...(profileIds.length ? { profiles: profileIds } : {}),
  })
}

onMounted(load)
onBeforeUnmount(recommendationEngine.abort)
</script>

<template>
  <div class="obm">
    <div v-if="error" class="obm-error">
      <Icon icon="tabler:alert-triangle" aria-hidden="true" />
      <span>{{ error }}</span>
      <button type="button" @click="queue.length ? startQueue() : load">{{ queue.length ? 'Retry failed' : 'Try again' }}</button>
    </div>

    <div v-if="installedCount" class="obm-success">
      <Icon icon="tabler:circle-check" aria-hidden="true" />
      <span>{{ installedCount }} module{{ installedCount === 1 ? '' : 's' }} added to this workspace.</span>
    </div>

    <div v-if="profileError" class="obm-note">
      <Icon icon="tabler:info-circle" aria-hidden="true" />
      <span>{{ profileError }}</span>
    </div>

    <div v-if="loading" class="obm-loading">
      <Icon icon="tabler:loader-2" class="spin" aria-hidden="true" />
      <span>Checking available modules…</span>
    </div>

    <section v-else-if="!customMode" class="obm-profiles" aria-labelledby="obm-profile-title">
      <div class="obm-profile-head">
        <div>
          <h2 id="obm-profile-title">Choose capabilities</h2>
          <p>Your foundation is included. Add any capabilities you need, then review and install everything together.</p>
        </div>
        <span v-if="optionalProfileCount">{{ optionalProfileCount }} selected</span>
      </div>

      <div v-if="requiredProfiles.length" class="obm-menu-section">
        <div class="obm-menu-label">
          <span>Included</span>
          <small>Ready in every workspace</small>
        </div>
        <ul class="obm-profile-grid" aria-label="Included capabilities">
          <li v-for="profile in requiredProfiles" :key="profile.id">
            <div class="obm-profile-card required">
              <span class="obm-profile-icon"><Icon :icon="profile.icon" aria-hidden="true" /></span>
              <span class="obm-profile-copy">
                <span class="obm-profile-title">{{ profile.title }}</span>
                <span class="obm-profile-description">{{ profile.description }}</span>
                <span class="obm-profile-packages"><Icon icon="tabler:packages" aria-hidden="true" /> {{ profilePackageLabels(profile) }}</span>
                <span v-if="profileSelection(profile).unavailable.length" class="obm-profile-warning">
                  {{ profileSelection(profile).unavailable.length }} package{{ profileSelection(profile).unavailable.length === 1 ? '' : 's' }} unavailable in this catalog
                </span>
              </span>
              <span class="obm-profile-state is-included">Included</span>
            </div>
          </li>
        </ul>
      </div>

      <div v-if="optionalProfiles.length" class="obm-menu-section">
        <div class="obm-menu-label">
          <span>Add capabilities</span>
          <small>Choose as many as you need</small>
        </div>
        <ul class="obm-profile-grid" aria-label="Optional capabilities">
          <li v-for="profile in optionalProfiles" :key="profile.id">
            <button
              type="button"
              class="obm-profile-card"
              :class="{ selected: selectedProfileIds.has(profile.id) }"
              :disabled="advancing || !profileUsable(profile)"
              :aria-pressed="selectedProfileIds.has(profile.id)"
              @click="chooseProfile(profile)"
            >
              <span class="obm-profile-icon"><Icon :icon="profile.icon" aria-hidden="true" /></span>
              <span class="obm-profile-copy">
                <span class="obm-profile-title">{{ profile.title }}</span>
                <span class="obm-profile-description">{{ profile.description }}</span>
                <span class="obm-profile-packages"><Icon icon="tabler:packages" aria-hidden="true" /> {{ profilePackageLabels(profile) }}</span>
                <span v-if="profileSelection(profile).unavailable.length" class="obm-profile-warning">
                  {{ profileSelection(profile).unavailable.length }} package{{ profileSelection(profile).unavailable.length === 1 ? '' : 's' }} unavailable in this catalog
                </span>
              </span>
              <span class="obm-profile-state" aria-hidden="true">
                <Icon :icon="selectedProfileIds.has(profile.id) ? 'tabler:circle-check-filled' : 'tabler:circle-plus'" />
                {{ selectedProfileIds.has(profile.id) ? 'Selected' : 'Add' }}
              </span>
            </button>
          </li>
        </ul>
      </div>

      <div class="obm-menu-section obm-custom-section">
        <ul class="obm-profile-grid obm-custom-grid" aria-label="More ways to build your setup">
          <li>
            <button type="button" class="obm-profile-card custom" :disabled="advancing" @click="chooseCustom('recommend')">
              <span class="obm-profile-icon"><Icon icon="tabler:sparkles" aria-hidden="true" /></span>
              <span class="obm-profile-copy">
                <span class="obm-profile-title">Recommend packages</span>
                <span class="obm-profile-description">Describe what you need and let AI prepare a package shortlist for review.</span>
              </span>
              <span class="obm-profile-state" aria-hidden="true"><Icon icon="tabler:chevron-right" /></span>
            </button>
          </li>

          <li>
            <button type="button" class="obm-profile-card custom" :disabled="advancing" @click="chooseCustom('browse')">
              <span class="obm-profile-icon"><Icon icon="tabler:packages" aria-hidden="true" /></span>
              <span class="obm-profile-copy">
                <span class="obm-profile-title">Browse packages</span>
                <span class="obm-profile-description">Search the installable catalog and add packages directly to your review.</span>
              </span>
              <span class="obm-profile-state" aria-hidden="true"><Icon icon="tabler:chevron-right" /></span>
            </button>
          </li>
        </ul>
      </div>
    </section>

    <template v-else>
      <div class="obm-custom-head">
        <button type="button" @click="backToProfiles"><Icon icon="tabler:arrow-left" aria-hidden="true" /> Profiles</button>
        <h2>{{ customMethod === 'recommend' ? 'Recommend packages' : 'Browse packages' }}</h2>
        <span v-if="customMethod === 'browse'">{{ browseResultCount }} available</span>
      </div>

      <div v-if="customMethod === 'recommend'" class="obm-prompt" :aria-busy="searching">
        <label for="obm-need">What should this workspace do?</label>
        <div class="obm-search">
          <Icon icon="tabler:sparkles" aria-hidden="true" />
          <input
            id="obm-need"
            v-model="prompt"
            placeholder="For example: analyze sales data and create reports"
            @keydown.enter.prevent="recommend"
          >
          <button type="button" :disabled="searching || tokens.length === 0 || advancing" @click="recommend">
            <Icon :icon="searching ? 'tabler:loader-2' : 'tabler:sparkles'" :class="{ spin: searching }" aria-hidden="true" />
            {{ searching ? 'Finding packages…' : 'Recommend packages' }}
          </button>
        </div>
        <span>AI chooses only from installable packages and adds them to your review list. Nothing installs until you confirm.</span>
        <div v-if="recommendationNotice" class="obm-recommendation-result" :class="`is-${recommendationNotice.tone}`" role="status">
          <span>{{ recommendationNotice.message }}</span>
          <button v-if="recommendationNotice.tone === 'warning'" type="button" :disabled="advancing" @click="matchCatalog">Match catalog instead</button>
        </div>
      </div>

      <div v-else class="obm-browse-search">
        <Icon icon="tabler:search" aria-hidden="true" />
        <input v-model="browseQuery" type="search" placeholder="Search packages" aria-label="Search available packages">
        <button v-if="browseQuery" type="button" aria-label="Clear package search" @click="browseQuery = ''">
          <Icon icon="tabler:x" aria-hidden="true" />
        </button>
      </div>
    </template>

    <div v-if="customMode && customMethod === 'browse' && !loading && browseGroups.length" class="obm-groups">
      <section v-for="group in browseGroups" :key="group.id" class="obm-group">
        <div class="obm-group-head">
          <Icon :icon="group.private ? 'tabler:lock' : group.id === 'official' ? 'tabler:rosette-discount-check' : 'tabler:packages'" aria-hidden="true" />
          <h2>{{ group.title }}</h2>
          <span>{{ group.modules.length }}</span>
        </div>
        <ul class="obm-package-list">
          <li
            v-for="module in group.modules"
            :key="moduleComponent(module)"
            class="obm-package-row"
            :style="{ '--module-accent': moduleAccent(module) }"
          >
            <div class="obm-package-icon"><Icon :icon="moduleIcon(module)" aria-hidden="true" /></div>
            <div class="obm-package-body">
              <div class="obm-package-title">
                <strong>{{ moduleLabel(module) }}</strong>
                <span v-if="moduleIsPrivate(module)" class="obm-private">private</span>
              </div>
              <code>{{ moduleComponent(module) }}</code>
              <p>{{ module.description || 'No description provided.' }}</p>
            </div>
            <button
              type="button"
              :class="{ selected: isQueued(module) }"
              :aria-pressed="isQueued(module)"
              :aria-label="`${isQueued(module) ? 'Remove' : 'Select'} ${moduleLabel(module)}`"
              :disabled="advancing"
              @click="toggleQueued(module)"
            >
              <Icon :icon="isQueued(module) ? 'tabler:check' : 'tabler:plus'" aria-hidden="true" />
              {{ isQueued(module) ? 'Selected' : 'Select' }}
            </button>
          </li>
        </ul>
      </section>
    </div>

    <div v-else-if="customMode && customMethod === 'browse' && !loading && !error" class="obm-empty">
      <Icon icon="tabler:package-off" aria-hidden="true" />
      <strong>{{ browseQuery ? 'No packages match this search' : 'Everything available is already installed' }}</strong>
      <span v-if="browseQuery">Try another name or clear the search.</span>
    </div>

    <section v-if="queue.length && !advancing && !queueTotal" class="obm-selection" aria-labelledby="obm-selection-title">
      <div class="obm-selection-head">
        <div>
          <h2 id="obm-selection-title">Review your setup</h2>
          <span>{{ queue.length }} package{{ queue.length === 1 ? '' : 's' }} ready to install</span>
        </div>
        <Icon icon="tabler:shopping-bag-check" aria-hidden="true" />
      </div>
      <ul class="obm-selection-items" aria-label="Packages ready to install">
        <li v-for="component in queue" :key="component">
          <Icon icon="tabler:package" aria-hidden="true" />
          <span><strong>{{ queuedLabel(component) }}</strong><small>{{ component }}</small></span>
        </li>
      </ul>
      <div class="obm-selection-action">
        <span>Nothing installs until you confirm.</span>
        <button type="button" class="obm-queue-retry" @click="startQueue">
          <Icon icon="tabler:download" aria-hidden="true" /> Install {{ queue.length }} package{{ queue.length === 1 ? '' : 's' }}
        </button>
      </div>
    </section>

    <section v-else-if="advancing || queueTotal" class="obm-queue" aria-labelledby="obm-install-title" aria-live="polite">
      <div class="obm-queue-head">
        <div>
          <h2 id="obm-install-title">{{ queueHeading }}</h2>
          <span>{{ queueCompleted }} of {{ queueTotal || queue.length }} complete</span>
        </div>
        <strong>{{ queuePercent }}%</strong>
      </div>
      <div
        class="obm-queue-progress"
        role="progressbar"
        aria-label="Package installation progress"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="queuePercent"
      >
        <span :style="{ width: `${queuePercent}%` }" />
      </div>
      <ul class="obm-queue-items" aria-label="Selected packages">
        <li
          v-for="item in (queueLedger.length ? queueLedger : queue.map(component => ({ component, label: queuedLabel(component), status: 'pending' as const, message: undefined })))"
          :key="item.component"
          :class="`is-${item.status}`"
        >
          <Icon
            :icon="item.status === 'installed' ? 'tabler:circle-check-filled' : item.status === 'installing' ? 'tabler:loader-2' : item.status === 'failed' ? 'tabler:alert-circle' : 'tabler:clock'"
            :class="{ spin: item.status === 'installing' }"
            aria-hidden="true"
          />
          <span><strong>{{ item.label }}</strong><small>{{ item.component }}</small><small v-if="item.message" class="obm-queue-error">{{ item.message }}</small></span>
          <em>{{ item.status }}</em>
        </li>
      </ul>
      <button v-if="queue.length && !advancing" type="button" class="obm-queue-retry" @click="startQueue">
        <Icon :icon="queueHasFailures ? 'tabler:refresh' : 'tabler:download'" aria-hidden="true" /> {{ queueActionLabel }}
      </button>
    </section>

    <div class="obm-foot">
      <button type="button" class="obm-back" @click="navigateBack">‹ {{ customMode ? 'Profiles' : 'Back' }}</button>
      <span />
      <button v-if="queueTerminal" type="button" class="obm-continue" :disabled="!canContinue" @click="finishOnboarding">
        {{ continueLabel }}
      </button>
    </div>
  </div>
</template>

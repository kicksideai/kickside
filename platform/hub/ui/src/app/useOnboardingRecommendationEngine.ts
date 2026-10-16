import { ref, type ComputedRef, type Ref } from 'vue'
import { keeperHub, type HubModuleListItem } from '../keeper-hub.ts'
import type { Events } from '../constants.ts'
import { boundedAssistCandidates, deterministicRecommendationIds, intersectRecommendedIds } from '../recommendations.ts'

interface RecommendationGroup { modules: HubModuleListItem[] }
interface RecommendationEngineOptions {
  hub: ReturnType<typeof keeperHub>
  emit: (event: 'instrumentRecommendations', payload: Events['instrumentRecommendations']) => void
  prompt: Ref<string>
  tokens: ComputedRef<string[]>
  catalogGroups: ComputedRef<RecommendationGroup[]>
  matchingGroups: ComputedRef<Parameters<typeof deterministicRecommendationIds>[0]>
  workspaceComponents: ComputedRef<Events['instrumentRecommendations']['workspace_context']['configured_components']>
  mergeCandidates: (rows: HubModuleListItem[]) => void
  addQueued: (ids: string[]) => void
  apiMessage: (cause: unknown, fallback: string) => string
  error: Ref<string>
}

export function useOnboardingRecommendationEngine({ hub, emit, prompt, tokens, catalogGroups, matchingGroups, workspaceComponents, mergeCandidates, addQueued, apiMessage, error }: RecommendationEngineOptions) {
  const searching = ref(false)
  const recommendationNotice = ref<{ tone: 'success' | 'info' | 'warning'; message: string } | null>(null)
  let assistController: AbortController | null = null

async function recommend() {
  if (searching.value) return
  const terms = tokens.value.slice(0, 6)
  if (!terms.length) return
  searching.value = true
  error.value = ''
  try {
    const results = await Promise.all(terms.map(term =>
      hub.browseModules({ query: term, pageSize: 100 }).then(result => result.items || []).catch(() => [])))
    for (const rows of results) mergeCandidates(rows)
    const groundedModules = catalogGroups.value.flatMap(group => group.modules)
    const assisted = await requestAssistedRanking(groundedModules)
    if (assisted.status !== 'success') {
      recommendationNotice.value = {
        tone: 'warning',
        message: assisted.message || 'AI recommendations are unavailable. You can match the live catalog or browse packages.',
      }
      return
    }
    if (!assisted.ids.length) {
      recommendationNotice.value = { tone: 'info', message: 'AI did not find a suitable package in the live catalog.' }
      return
    }
    addQueued(assisted.ids)
    recommendationNotice.value = {
      tone: 'success',
      message: `${assisted.ids.length} package${assisted.ids.length === 1 ? '' : 's'} added to your selection. Review the list, then install when ready.`,
    }
  } catch (cause) {
    recommendationNotice.value = { tone: 'warning', message: apiMessage(cause, 'AI recommendations are unavailable.') }
  } finally {
    searching.value = false
  }
}

function recommendationNeed(): string {
  return prompt.value.trim()
}

interface AssistedRankingResult {
  status: 'success' | 'unavailable' | 'error'
  ids: string[]
  message?: string
}

function normalizeAssistedResult(value: unknown, candidateIds: string[]): AssistedRankingResult {
  if (Array.isArray(value)) return { status: 'success', ids: intersectRecommendedIds(value, candidateIds) }
  if (!value || typeof value !== 'object') return { status: 'error', ids: [], message: 'The recommendation service returned an invalid response.' }
  const row = value as { success?: unknown; component_ids?: unknown; code?: unknown; error?: unknown }
  if (row.success === true) return { status: 'success', ids: intersectRecommendedIds(row.component_ids, candidateIds) }
  const message = typeof row.error === 'string' && row.error.trim() ? row.error.trim() : 'AI recommendations are unavailable.'
  return { status: row.code === 'MODEL_UNAVAILABLE' ? 'unavailable' : 'error', ids: [], message }
}

async function requestAssistedRanking(modules: HubModuleListItem[]): Promise<AssistedRankingResult> {
  const candidates = boundedAssistCandidates(modules)
  const candidateIds = candidates.map(candidate => candidate.component)
  if (!candidateIds.length) return { status: 'error', ids: [], message: 'No installable catalog packages are available.' }
  if (assistController) assistController.abort()
  const controller = new AbortController()
  assistController = controller
  return new Promise(resolve => {
    let settled = false
    let accepted = false
    const finish = (value: unknown) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      if (assistController === controller) assistController = null
      resolve(normalizeAssistedResult(value, candidateIds))
    }
    const timer = setTimeout(() => {
      controller.abort()
      finish({ success: false, code: 'TIMEOUT', error: 'AI recommendations timed out.' })
    }, 8000)
    emit('instrumentRecommendations', {
      need: recommendationNeed(),
      candidate_ids: [...candidateIds],
      candidates,
      workspace_context: { configured_components: workspaceComponents.value },
      signal: controller.signal,
      accept: () => { if (!settled) accepted = true },
      respond: finish,
    })
    // CustomEvent dispatch is synchronous. Without an app composition host (or
    // without a usable model), do not make a standalone Hub wait for timeout.
    if (!accepted) finish({ success: false, code: 'MODEL_UNAVAILABLE', error: 'No configured AI model is available for this onboarding session.' })
  })
}

function matchCatalog() {
  const ids = deterministicRecommendationIds(matchingGroups.value)
  if (!ids.length) {
    recommendationNotice.value = { tone: 'info', message: 'No catalog packages matched. Try another description or browse packages.' }
    return
  }
  addQueued(ids)
  recommendationNotice.value = {
    tone: 'info',
    message: `${ids.length} package${ids.length === 1 ? '' : 's'} matched from catalog metadata and added to your selection.`,
  }
}

  function abort() {
    assistController?.abort()
    assistController = null
  }

  return { searching, recommendationNotice, recommend, matchCatalog, abort }
}

import { computed, ref, type Ref } from 'vue'
import { type HubInstallPlan, type HubParameter, type HubParameterValue, type HubPlanRequirement } from '../keeper-hub.ts'
import { isTransitiveRequirement, requirementKey } from '../lib.ts'
import { logError } from './modules-page-utils.ts'
import type { InstallDialogProps, SectionKey } from './useInstallDialog.ts'

interface InstallRequirementsOptions {
  props: InstallDialogProps
  hub: ReturnType<typeof import('../keeper-hub.ts').keeperHub>
  plan: Ref<HubInstallPlan | null>
  activeSection: Ref<SectionKey>
  versionArg: () => string | undefined
  requirementPayload: () => { parameters?: HubParameter[]; requirement_bindings?: HubParameter[] }
  invalidatePlan: () => void
  refreshPlan: () => Promise<void>
  planCurrent: Ref<boolean>
}

export function useInstallRequirements({ props, hub, plan, activeSection, versionArg, requirementPayload, invalidatePlan, refreshPlan, planCurrent }: InstallRequirementsOptions) {
  // ── Requirements ───────────────────────────────────────────────────────────
  const requirements = ref<HubPlanRequirement[]>([])
  const parameterValues = ref<Record<string, HubParameterValue>>({})
  const installedParameterHints = ref<Record<string, HubParameterValue>>({})
  // Group by module: the direct module first, then transitive, alpha within.
  const requirementGroups = computed(() => {
    const map = new Map<string, HubPlanRequirement[]>()
    for (const req of requirements.value) {
      const key = String(req.module || '')
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(req)
    }
    return Array.from(map.entries())
      .map(([module, items]) => ({ module, items, direct: !items.every(r => isTransitiveRequirement(r, props.component)) }))
      .sort((a, b) => (a.direct === b.direct ? a.module.localeCompare(b.module) : a.direct ? -1 : 1))
  })
  const rootRequirements = computed(() => requirements.value.filter(r => !isTransitiveRequirement(r, props.component)))
  const editableRequirements = computed(() => requirements.value.filter(r => !requirementReadOnly(r)))
  const transitiveRequirementCount = computed(() => requirements.value.length - rootRequirements.value.length)
  const missingRequirements = computed<string[]>(() => {
    const out: string[] = []
    for (const req of requirements.value) {
      const key = requirementKey(req)
      if (!key || (!req.required && !req.missing)) continue
      if (valueIsEmpty(parameterValues.value[key])) out.push(key)
    }
    return out
  })
  const boundRequirementCount = computed(() =>
    requirements.value.filter(r => !valueIsEmpty(parameterValues.value[requirementKey(r)])).length)
  const autoFitCount = computed(() => autoFitEntries().length)
  const aiResolving = ref(false)
  const aiResolutionNotice = ref<{ tone: 'success' | 'warning'; message: string; code?: string; kind?: string; details?: unknown } | null>(null)
  let aiController: AbortController | null = null
  // Bumped to re-trigger the "scroll to + flash the first empty required field".
  const highlightTick = ref(0)

  const pendingSuggestions = ref<Record<string, HubPlanRequirement>>({})
  const pendingCount = computed(() => Object.keys(pendingSuggestions.value).length)
  let reviewRevision = 0
  const editedKeys = new Set<string>()

  function valueIsEmpty(value: unknown): boolean {
    return value == null || value === '' || (typeof value === 'string' && !value.trim())
      || (Array.isArray(value) && value.length === 0)
      || (typeof value === 'object' && Object.keys(value).length === 0)
  }
  function displayValue(value: unknown): string {
    return value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value)
  }
  function declaredType(req: HubPlanRequirement): string {
    if (req.expected_type) return req.expected_type
    const values = [req.value, req.default, ...(req.suggestions || []).map(s => s.value)]
    for (const value of values) {
      if (typeof value === 'boolean' || typeof value === 'number') return typeof value
      if (Array.isArray(value)) return 'array'
      if (value && typeof value === 'object') return 'object'
    }
    return 'string'
  }
  function typedParameter(req: HubPlanRequirement, value: HubParameterValue): HubParameterValue {
    if (typeof value !== 'string') return value
    const text = value.trim()
    const kind = declaredType(req)
    if (kind === 'boolean') return /^(true|false)$/.test(text) ? text === 'true' : value
    if (kind === 'number' || kind === 'integer') return text && Number.isFinite(Number(text)) ? Number(text) : value
    if (kind === 'array' || kind === 'object') {
      try { return JSON.parse(text) as HubParameterValue } catch { return value }
    }
    return value
  }
  function typeMatches(req: HubPlanRequirement, value: unknown): boolean {
    const kind = declaredType(req)
    if (kind === 'array') return Array.isArray(value)
    if (kind === 'object') return value !== null && typeof value === 'object' && !Array.isArray(value)
    if (kind === 'integer') return typeof value === 'number' && Number.isInteger(value)
    return typeof value === kind && (kind !== 'number' || Number.isFinite(value))
  }
  function setParameter(req: HubPlanRequirement, value: HubParameterValue | undefined) {
    const key = requirementKey(req)
    if (!key || requirementReadOnly(req)) return
    const parsed = typedParameter(req, value ?? '')
    if (JSON.stringify(parameterValues.value[key]) === JSON.stringify(parsed)) return
    editedKeys.add(key)
    parameterValues.value = { ...parameterValues.value, [key]: parsed }
    invalidatePlan()
  }
  function requirementTypeInvalid(req: HubPlanRequirement): boolean {
    const current = parameterValues.value[requirementKey(req)]
    return !requirementReadOnly(req) && !valueIsEmpty(current) && !typeMatches(req, current)
  }
  function requirementTypeHint(req: HubPlanRequirement): string {
    const kind = declaredType(req)
    return kind === 'boolean' ? 'expects true or false' : `expects ${kind === 'integer' || kind === 'object' || kind === 'array' ? 'an' : 'a'} ${kind}`
  }
  const typeInvalidRequirements = computed<string[]>(() =>
    requirements.value.filter(requirementTypeInvalid).map(requirementKey).filter(Boolean))
  function requirementValue(req: HubPlanRequirement): string {
    return displayValue(parameterValues.value[requirementKey(req)])
  }
  function requirementMissing(req: HubPlanRequirement): boolean {
    return (req.required || req.missing) === true && valueIsEmpty(parameterValues.value[requirementKey(req)])
  }
  function requirementReadOnly(req: HubPlanRequirement): boolean {
    return isTransitiveRequirement(req, props.component) && req.missing !== true
      && !editedKeys.has(requirementKey(req))
  }
  // Suggestions the planner surfaced (existing bindings, package default, registry
  // candidates of the expected kind) → dropdown options for a typed requirement.
  function requirementOptions(req: HubPlanRequirement): { label: string; value: string; title?: string }[] {
    const seen = new Set<string>()
    const out: { label: string; value: string; title?: string }[] = []
    for (const s of req.suggestions || []) {
      const value = displayValue(s.value).trim()
      if (!value || seen.has(value)) continue
      seen.add(value)
      const label = String(s.label || value).trim()
      const title = [s.kind, s.source, s.description].filter(Boolean).map(String).join(' | ')
      out.push({ label: label && label !== value ? `${label} (${value})` : value, value, title })
    }
    return out
  }

  function installedParameterValues(): Record<string, HubParameterValue> {
    const out: Record<string, HubParameterValue> = {}
    const add = (name: string, value: unknown) => {
      name = String(name || '').trim()
      if (!name) return
      out[name] = value as HubParameterValue
      const short = name.includes(':') ? name.split(':').pop() || '' : ''
      if (short && out[short] === undefined) out[short] = out[name]
    }
    const params = props.installedDep?.parameters
    if (Array.isArray(params)) {
      for (const p of params) {
        add(p.name, p.value)
      }
    } else if (params && typeof params === 'object') {
      for (const [name, value] of Object.entries(params)) add(name, value)
    }
    return out
  }

  async function loadInstalledParameterHints() {
    installedParameterHints.value = {}
    if (!hub) return
    try {
      const res = await hub.listDependencies({ includeEntries: false, includeMigrations: false })
      const out: Record<string, HubParameterValue> = {}
      const add = (name: string, value: unknown) => {
        name = String(name || '').trim()
        const str = String(value ?? '').trim()
        if (!name || !str || out[name] !== undefined) return
        out[name] = value as HubParameterValue
        const short = name.includes(':') ? name.split(':').pop() || '' : ''
        if (short && out[short] === undefined) out[short] = out[name]
      }
      for (const dep of res.dependencies || []) {
        const params = dep.parameters
        if (Array.isArray(params)) {
          for (const p of params) add(p.name, p.value)
        } else if (params && typeof params === 'object') {
          for (const [name, value] of Object.entries(params)) add(name, value)
        }
      }
      installedParameterHints.value = out
    } catch (e) {
      logError('install:dependency-parameters', e)
    }
  }

  function recommendedValueFor(key: string): string {
    for (const p of plan.value?.recommended_parameters || []) {
      if (p.name === key && displayValue(p.value).trim() !== '') return displayValue(p.value)
    }
    return ''
  }

  function hintedValueFor(req: HubPlanRequirement): string {
    const keys = [
      requirementKey(req),
      String(req.parameter_name || ''),
      String(req.full_id || ''),
      String(req.name || ''),
      String(req.short_name || ''),
    ].map(k => k.trim()).filter(Boolean)
    for (const k of keys) {
      const v = displayValue(installedParameterHints.value[k]).trim()
      if (v) return v
      const short = k.includes(':') ? k.split(':').pop() || '' : ''
      if (short) {
        const sv = displayValue(installedParameterHints.value[short]).trim()
        if (sv) return sv
      }
    }
    return ''
  }

  function autoFitValue(req: HubPlanRequirement): string {
    const key = requirementKey(req)
    if (!key || requirementReadOnly(req)) return ''
    const current = String(parameterValues.value[key] ?? '').trim()
    if (current) return ''
    const recommended = recommendedValueFor(key).trim()
    if (recommended) return recommended
    const hinted = hintedValueFor(req)
    if (hinted) return hinted
    const def = displayValue(req.default).trim()
    if (def) return def
    const suggestions = requirementOptions(req).map(o => o.value).filter(Boolean)
    if (suggestions.length === 1) return suggestions[0]
    const ranked = rankedAutoFitOptions(req)
    return ranked.length && ranked[0].score > 0 && (ranked.length === 1 || ranked[0].score > ranked[1].score)
      ? ranked[0].value
      : ''
  }

  function rankedAutoFitOptions(req: HubPlanRequirement): { value: string; score: number }[] {
    if (String(req.expected_kind || '').trim() !== 'security.scope') return []
    return (req.suggestions || [])
      .map(s => {
        const value = displayValue(s.value).trim()
        const label = String(s.label || '').toLowerCase()
        const description = String(s.description || '').toLowerCase()
        let score = 0
        if (!value) score -= 1000
        if (label.includes('system') || description.includes('system') || description.includes('internal')) score -= 50
        if (label.includes('admin') || description.includes('full access') || description.includes('assign sparingly')) score -= 50
        if (description.includes('signed-in') || description.includes('authenticated')) score += 30
        if (label === 'user' || label === 'member') score += 20
        return { value, score }
      })
      .filter(o => o.value)
      .sort((a, b) => b.score - a.score || a.value.localeCompare(b.value))
  }

  function autoFitEntries(): HubParameter[] {
    const out: HubParameter[] = []
    for (const req of editableRequirements.value) {
      if (!requirementMissing(req)) continue
      const name = requirementKey(req)
      const value = autoFitValue(req)
      if (name && value) out.push({ name, value })
    }
    return out
  }

  function canAutoFitRequirement(req: HubPlanRequirement): boolean {
    return autoFitValue(req) !== ''
  }

  function autoFitRequirement(req: HubPlanRequirement) {
    const key = requirementKey(req)
    const value = autoFitValue(req)
    if (!key || !value) { activeSection.value = 'requirements'; highlightTick.value++; return }
    setParameter(req, value)
  }

  function autoFitRequirements() {
    const entries = autoFitEntries()
    if (!entries.length) { activeSection.value = 'requirements'; highlightTick.value++; return }
    for (const p of entries) {
      const req = requirements.value.find(r => requirementKey(r) === p.name)
      if (req) setParameter(req, String(p.value))
    }
  }

  function aiRequirements() {
    return editableRequirements.value.filter(req => valueIsEmpty(parameterValues.value[requirementKey(req)])
      && (req.missing || req.value_source === 'conflict' || req.expected_type || requirementOptions(req).length))
      .map(req => ({ name: req.full_id || requirementKey(req) }))
  }
  const aiResolvableCount = computed(() => aiRequirements().length)

  function proposalValid(req: HubPlanRequirement, value: unknown): boolean {
    if (valueIsEmpty(value) || !typeMatches(req, value)) return false
    return !req.expected_kind || !!req.suggestions?.some(candidate => candidate.value === value)
  }
  function stageSuggestions(keys: string[]) {
    const remaining = { ...pendingSuggestions.value }
    const values = { ...parameterValues.value }
    for (const key of keys) {
      const proposal = remaining[key]
      if (proposal?.value === undefined) continue
      values[key] = proposal.value
      editedKeys.add(key)
      delete remaining[key]
    }
    parameterValues.value = values
    invalidatePlan()
    return remaining
  }
  async function acceptSuggestions(keys: string[]) {
    if (!planCurrent.value || aiResolving.value) return
    const remaining = stageSuggestions(keys)
    const revision = reviewRevision
    await refreshPlan()
    if (revision !== reviewRevision || !planCurrent.value) return
    const valid: Record<string, HubPlanRequirement> = {}
    for (const req of editableRequirements.value) {
      const key = requirementKey(req)
      const proposal = remaining[key]
      if (proposal && valueIsEmpty(parameterValues.value[key]) && req.expected_type === proposal.expected_type
          && req.expected_kind === proposal.expected_kind && proposalValid(req, proposal.value)) valid[key] = proposal
    }
    pendingSuggestions.value = valid
  }
  function rejectSuggestions(keys: string[]) {
    const next = { ...pendingSuggestions.value }
    for (const key of keys) delete next[key]
    pendingSuggestions.value = next
  }
  function editSuggestions(keys: string[]) {
    if (!planCurrent.value || aiResolving.value) return
    stageSuggestions(keys)
  }

  async function resolveRequirementsWithAI(target?: EventTarget | null) {
    const unresolved = aiRequirements()
    if (!planCurrent.value || !unresolved.length || aiResolving.value) return
    abortAI()
    const revision = reviewRevision
    const controller = new AbortController()
    aiController = controller
    aiResolving.value = true
    aiResolutionNotice.value = null
    pendingSuggestions.value = {}
    await new Promise<void>(resolve => {
      let settled = false
      let accepted = false
      const finish = (raw: unknown) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        if (controller.signal.aborted || revision !== reviewRevision || aiController !== controller) { resolve(); return }
        aiController = null
        const result = raw && typeof raw === 'object' ? raw as {
          success?: boolean; code?: string; error?: string; kind?: string; details?: unknown;
          parameters?: (HubParameter & { reason?: string })[]; requirements?: HubPlanRequirement[];
        } : {}
        if (result.success === true) {
          const selected = new Set(unresolved.map(row => row.name))
          const proposals: Record<string, HubPlanRequirement> = {}
          const returned = new Map((result.requirements || []).map(req => [req.full_id, req]))
          requirements.value = requirements.value.map(req => ({ ...req,
            resolution_error: returned.get(req.full_id)?.resolution_error }))
          for (const answer of result.parameters || []) {
            const req = requirements.value.find(req => (req.full_id || requirementKey(req)) === answer.name || requirementKey(req) === answer.name)
            if (!req || !selected.has(req.full_id || requirementKey(req)) || !proposalValid(req, answer.value)
                || typeof answer.reason !== 'string' || !answer.reason.trim()) {
              aiResolutionNotice.value = { tone: 'warning', code: 'INVALID_CHOICE', message: 'AI returns an invalid planned value or omits its reason. Choose a value manually.' }
              continue
            }
            proposals[requirementKey(req)] = { ...req, value: answer.value, choice_reason: answer.reason }
          }
          pendingSuggestions.value = proposals
          if (Object.keys(proposals).length) aiResolutionNotice.value = { tone: 'success', message: 'Review AI suggestions before applying.' }
          else if (!aiResolutionNotice.value) aiResolutionNotice.value = { tone: 'warning', message: 'No valid AI suggestion is available. Choose a value manually.' }
        } else {
          aiResolutionNotice.value = { tone: 'warning', code: result.code, kind: result.kind, details: result.details,
            message: result.error || 'AI could not resolve these settings. Choose a value manually.' }
        }
        aiResolving.value = false
        resolve()
      }
      const timer = setTimeout(() => {
        finish({ success: false, code: 'TIMEOUT', error: 'AI requirement resolution timed out.' })
        controller.abort()
      }, 20000)
      controller.signal.addEventListener('abort', () => {
        if (!settled) { settled = true; clearTimeout(timer); resolve() }
      }, { once: true })
      const detail = {
        component: props.component,
        ...(versionArg() ? { version: versionArg() } : {}),
        ...(props.mode === 'update' && props.currentId ? { current_id: props.currentId } : {}),
        ...requirementPayload(), requirements: unresolved, signal: controller.signal,
        accept: () => { if (!settled) accepted = true }, respond: finish,
      }
      target?.dispatchEvent(new CustomEvent('instrumentRequirementResolution', { detail, bubbles: true, composed: true }))
      if (!accepted) finish({ success: false, code: 'MODEL_UNAVAILABLE', error: 'Configure an AI model to suggest settings, or choose values manually.' })
    })
  }

  function applyPlan(p: HubInstallPlan, previous: Record<string, HubParameterValue>) {
    plan.value = p
    requirements.value = (p.requirements || []).filter(req => req.name !== 'required_setup' && req.short_name !== 'required_setup')
    const installedValues = installedParameterValues()
    const values: Record<string, HubParameterValue> = {}
    for (const req of requirements.value) {
      const key = requirementKey(req)
      if (!key) continue
      const short = String(req.name || req.short_name || key.split(':').pop() || '')
      values[key] = (editedKeys.has(key) ? previous[key] : valueIsEmpty(previous[key]) ? undefined : previous[key]) ?? installedValues[key] ?? installedValues[short] ?? installedParameterHints.value[key] ?? installedParameterHints.value[short] ?? req.value ?? req.default ?? ''
    }
    parameterValues.value = values
    for (const key of editedKeys) { if (!(key in values)) editedKeys.delete(key) }
  }


  function abortAI() {
    aiController?.abort()
    aiController = null
    aiResolving.value = false
    reviewRevision++
    pendingSuggestions.value = {}
    aiResolutionNotice.value = null
  }

  function resetRequirements() {
    abortAI()
    requirements.value = []
    parameterValues.value = {}
    editedKeys.clear()
    installedParameterHints.value = {}
    aiResolving.value = false
    aiResolutionNotice.value = null
  }


  return {
    pendingSuggestions, pendingCount, acceptSuggestions, rejectSuggestions, editSuggestions, displayValue,
    requirements, parameterValues, installedParameterHints,
    requirementGroups, rootRequirements, editableRequirements, transitiveRequirementCount,
    missingRequirements, boundRequirementCount, autoFitCount, aiResolving, aiResolutionNotice,
    typeInvalidRequirements, highlightTick, aiResolvableCount,
    setParameter, requirementTypeInvalid, requirementTypeHint, requirementValue, requirementMissing,
    requirementReadOnly, requirementOptions, loadInstalledParameterHints, applyPlan,
    recommendedValueFor, hintedValueFor, autoFitValue, canAutoFitRequirement, autoFitRequirement,
    autoFitRequirements, resolveRequirementsWithAI, abortAI, resetRequirements,
  }
}

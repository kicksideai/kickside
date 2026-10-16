// The install popup's state machine. One catalog, two ways to configure what it
// selected — a type's contributed create view or the declared-input fallback form —
// and one footer action that submits whichever is mounted. The catalog is registry-owned: Automation never invents, suppresses,
// renames, or interprets another module's type.

import { computed, ref, nextTick, type ComputedRef, type Ref } from 'vue'
import { api, loadByTagName } from '@wippy-fe/proxy'
import { errMsg } from '@widgets/app/errMsg'
import { automationTypeDescription } from './type-copy'
import { customCreateLocation, customCreateTag, requestCustomSubmit } from './custom-view'
import { defaultsFor, fieldsOf, installInput, validateInstall } from './install-form'
import type { AutomationType } from './automation-types'

export interface InstallFlowOptions {
  types: Ref<AutomationType[]>
  createMode: ComputedRef<boolean>
  componentMode: ComputedRef<boolean>
  effectiveParentId: ComputedRef<string>
  preferredTypeId: ComputedRef<string>
  inputPreset: ComputedRef<Record<string, unknown>>
  emitHost: (name: 'created' | 'close', detail: Record<string, unknown>) => void
  reload: () => Promise<void>
}

export function useInstallFlow(options: InstallFlowOptions) {
  const showInstall = ref(false)
  const installType = ref<AutomationType | null>(null)
  const installForm = ref<Record<string, unknown>>({})
  const installing = ref(false)
  // Saving state reported by a mounted custom create form, so the shell footer
  // button reflects its progress.
  const customSaving = ref(false)
  const installError = ref('')
  const customInstallHost = ref<HTMLElement | null>(null)
  const installSearchInput = ref<HTMLInputElement | null>(null)
  let customInstallEl: HTMLElement | null = null

  const typeSearch = ref('')
  // The catalog offers only the types the server marks installable; every other
  // type still reaches the page as a row descriptor.
  const catalog = computed<AutomationType[]>(() => options.types.value.filter(t =>
    t.installable !== false && Object.entries(options.inputPreset.value).every(([key, value]) => {
      const field = t.inputs?.properties?.[key]
      return !!field && (!field.enum || (typeof value === 'string' && field.enum.includes(value)))
    }),
  ))
  const showTypeCatalog = computed(() => !options.componentMode.value
    || !options.preferredTypeId.value || installType.value?.id !== options.preferredTypeId.value)
  const installFields = computed(() => installType.value
    ? fieldsOf(installType.value).filter(([key]) => !(key in options.inputPreset.value)) : [])
  const filteredTypes = computed(() => {
    const q = typeSearch.value.trim().toLowerCase()
    if (!q) return catalog.value
    return catalog.value.filter(t =>
      (t.title || '').toLowerCase().includes(q) ||
      (t.name || '').toLowerCase().includes(q) ||
      automationTypeDescription(t).toLowerCase().includes(q),
    )
  })

  function openInstall(t?: AutomationType) {
    unmountCustomInstallUi()
    typeSearch.value = ''
    installType.value = t || null
    installForm.value = t ? { ...defaultsFor(t), ...options.inputPreset.value } : {}
    installError.value = ''
    showInstall.value = true
    void nextTick(mountCustomInstallUi)
  }
  function chooseType(t: AutomationType) {
    unmountCustomInstallUi()
    installType.value = t
    installForm.value = { ...defaultsFor(t), ...options.inputPreset.value }
    installError.value = ''
    void nextTick(mountCustomInstallUi)
  }
  function closeInstall() {
    unmountCustomInstallUi()
    showInstall.value = false
    installType.value = null
    installForm.value = {}
    installError.value = ''
    customSaving.value = false
    if (options.createMode.value) options.emitHost('close', {})
  }
  function focusInstallDialog() {
    if (!showTypeCatalog.value || installType.value) return
    void nextTick(() => installSearchInput.value?.focus({ preventScroll: true }))
  }

  async function mountCustomInstallUi() {
    const t = installType.value
    const tag = customCreateTag(t)
    if (!tag || !t || !customInstallHost.value) return
    try {
      await loadByTagName(tag, { timeoutMs: 8000 })
      if (installType.value?.id !== t.id || !customInstallHost.value) return
      const el = document.createElement(tag)
      el.setAttribute('type-id', t.id)
      el.setAttribute('input', JSON.stringify(options.inputPreset.value))
      // parent-id carries placement, including the owning component this manager is
      // scoped to. component-id names the instance a create view EDITS, so it is
      // never set on the create mount.
      if (options.effectiveParentId.value) el.setAttribute('parent-id', options.effectiveParentId.value)
      // The manager owns the dialog footer for every registry-declared create view.
      el.setAttribute('embedded', 'true')
      el.addEventListener('automation-installed', onCustomInstallDone as EventListener)
      el.addEventListener('submit-state', onCustomSubmitState as EventListener)
      customInstallHost.value.innerHTML = ''
      customInstallHost.value.appendChild(el)
      customInstallEl = el
    } catch (e) {
      const location = customCreateLocation(t)
      installError.value = `Failed to load setup UI (${tag}${location ? ` at ${location}` : ''}): ` +
        (e instanceof Error ? e.message : String(e))
    }
  }

  function onCustomSubmitState(ev: Event) {
    customSaving.value = !!((ev as CustomEvent).detail?.saving)
  }

  // The shell footer's Create button submits the mounted custom form (or the default
  // field form), so every automation type shares one popup-level action bar.
  function onCreate() {
    if (customCreateTag(installType.value)) {
      requestCustomSubmit(customInstallEl)
    } else {
      void submitInstall()
    }
  }

  async function onCustomInstallDone(ev: Event) {
    const detail = (ev as CustomEvent).detail as { success?: boolean; error?: string; id?: string } | undefined
    if (detail?.success === false) {
      installError.value = detail?.error || 'Could not create the automation.'
      customSaving.value = false
      return
    }
    if (options.createMode.value) { options.emitHost('created', { id: detail?.id }); return }
    closeInstall()
    await options.reload()
  }

  function unmountCustomInstallUi() {
    if (customInstallEl) {
      customInstallEl.removeEventListener('automation-installed', onCustomInstallDone as EventListener)
      customInstallEl.removeEventListener('submit-state', onCustomSubmitState as EventListener)
      customInstallEl.remove()
      customInstallEl = null
    }
    if (customInstallHost.value) customInstallHost.value.innerHTML = ''
  }

  function preferredType(): AutomationType | undefined {
    const id = options.preferredTypeId.value
    return id ? catalog.value.find((type) => type.id === id) : undefined
  }

  function openPreferredInstall() {
    openInstall(preferredType())
  }

  async function submitInstall() {
    const t = installType.value
    if (!t) return
    const invalid = validateInstall(t, installForm.value)
    if (invalid) { installError.value = invalid; return }
    installing.value = true
    installError.value = ''
    try {
      const { data } = await api.post('/api/v1/automations', {
        type: t.id,
        input: installInput(t, installForm.value),
        parent_id: options.effectiveParentId.value || undefined,
      })
      if (data?.success) {
        if (options.createMode.value) { options.emitHost('created', { id: data.id }); return }
        closeInstall()
        await options.reload()
      } else {
        installError.value = errMsg({ response: { data } }, 'install failed')
      }
    } catch (e) {
      installError.value = errMsg(e, 'install failed')
    } finally {
      installing.value = false
    }
  }

  return {
    showTypeCatalog,
    installFields,
    showInstall,
    installType,
    installForm,
    installing,
    customSaving,
    installError,
    customInstallHost,
    installSearchInput,
    typeSearch,
    filteredTypes,
    openInstall,
    openPreferredInstall,
    chooseType,
    closeInstall,
    focusInstallDialog,
    onCreate,
    unmountCustomInstallUi,
  }
}

export type InstallFlow = ReturnType<typeof useInstallFlow>

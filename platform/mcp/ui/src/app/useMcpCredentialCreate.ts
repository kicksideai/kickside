import { computed, ref, type Ref } from 'vue'
import { host } from '@wippy-fe/proxy'
import type { Credential, Entry, MintedCredential } from '../types.ts'
import { fetchEntries, createCredential, errMsg } from '../api.ts'

interface McpCredentialCreateOptions {
  credentials: Ref<Credential[]>
  reload: () => Promise<void>
}

const CLASS_ICON: Record<string, string> = {
  folder: 'tabler:folder',
  workspace: 'tabler:folder',
  knowledge_base: 'tabler:books',
  agent: 'tabler:robot',
  connection: 'tabler:plug',
  inbox: 'tabler:inbox',
}

export function useMcpCredentialCreate({ credentials, reload }: McpCredentialCreateOptions) {
  const createOpen = ref(false)
  const saving = ref(false)
  const formError = ref('')
  const minted = ref<MintedCredential | null>(null)
  const form = ref({ label: '', ttl: '' as string, traits: [] as string[] })
  const traitContexts = ref<Record<string, unknown>>({})
  const whitelist = ref<{ id: string; name: string }[]>([])
  const crumbs = ref<{ id: string; name: string }[]>([])
  const children = ref<Entry[]>([])
  const browsing = ref(false)
  const serverMcpUrl = ref('')
  const browserOrigin = computed(() => {
    const origin = typeof location !== 'undefined' ? location.origin : ''
    return origin && origin !== 'null' ? `${origin.replace(/\/$/, '')}/api/public/mcp` : '/api/public/mcp'
  })
  const mcpUrl = computed(() =>
    minted.value?.mcp_url || credentials.value.find(credential => credential.mcp_url)?.mcp_url || serverMcpUrl.value || browserOrigin.value)
  const snippet = computed(() => minted.value
    ? JSON.stringify({ type: 'streamable-http', url: mcpUrl.value, headers: { Authorization: `Bearer ${minted.value.token}` } }, null, 2)
    : '')
  const claudeCodeCmd = computed(() => minted.value
    ? `claude mcp add --transport http kickside ${mcpUrl.value} --header "Authorization: Bearer ${minted.value.token}"`
    : '')

  const traitPickerValue = computed(() => JSON.stringify({
    traits: form.value.traits,
    trait_contexts: traitContexts.value,
  }))

  async function browse(parentId: string | undefined, crumb: { id: string; name: string } | null) {
    browsing.value = true
    try {
      children.value = await fetchEntries(parentId)
      if (crumb) crumbs.value.push(crumb)
    } catch (e) {
      children.value = []
      formError.value = errMsg(e, 'could not load components')
    } finally { browsing.value = false }
  }

  function openCreate() {
    form.value = { label: '', ttl: '', traits: [] }
    traitContexts.value = {}
    whitelist.value = []
    crumbs.value = []
    formError.value = ''
    minted.value = null
    createOpen.value = true
    browse(undefined, null)
  }
  function closeCreate() { createOpen.value = false; minted.value = null; formError.value = '' }

  function crumbTo(index: number) {
    const crumb = crumbs.value[index]
    crumbs.value = crumbs.value.slice(0, index)
    browse(crumb?.id, crumb || null)
  }
  function crumbRoot() { crumbs.value = []; browse(undefined, null) }
  function openFolder(entry: Entry) { browse(entry.id, { id: entry.id, name: entry.name || '' }) }
  const currentFolder = computed(() => crumbs.value.length ? crumbs.value[crumbs.value.length - 1] : null)
  function inWhitelist(id: string) { return whitelist.value.some(item => item.id === id) }
  const atRoot = computed(() => crumbs.value.length === 0)
  const scopeActive = computed(() => atRoot.value ? whitelist.value.length === 0 : inWhitelist(currentFolder.value!.id))
  const scopeLabel = computed(() => {
    if (atRoot.value) return whitelist.value.length === 0 ? 'Home — full account' : 'Scope to home'
    return inWhitelist(currentFolder.value!.id) ? 'Added' : 'Add this folder'
  })
  function addScope() {
    if (atRoot.value) whitelist.value = []
    else toggleWhitelist(currentFolder.value!)
  }
  function toggleWhitelist(entry: Entry) {
    if (inWhitelist(entry.id)) whitelist.value = whitelist.value.filter(item => item.id !== entry.id)
    else whitelist.value.push({ id: entry.id, name: entry.name || '' })
  }
  function removeWhitelist(id: string) { whitelist.value = whitelist.value.filter(item => item.id !== id) }
  function classIcon(entry: Entry) { return (entry.class && CLASS_ICON[entry.class]) || 'tabler:box' }

  function onTraitPickerChange(event: Event) {
    const value = (event as CustomEvent).detail as { traits?: unknown; trait_contexts?: unknown } | undefined
    if (!Array.isArray(value?.traits) || !value.trait_contexts || typeof value.trait_contexts !== 'object' || Array.isArray(value.trait_contexts)) return
    form.value.traits = value.traits.filter((id: unknown): id is string => typeof id === 'string')
    traitContexts.value = value.trait_contexts as Record<string, unknown>
  }

  async function submit() {
    const label = form.value.label.trim()
    if (!label) { formError.value = 'A label is required so you can recognize this credential later.'; return }
    saving.value = true
    formError.value = ''
    try {
      const ttlDays = parseInt(form.value.ttl, 10)
      const result = await createCredential({
        whitelist_component_ids: whitelist.value.map(item => item.id),
        label,
        allowed_trait_ids: form.value.traits,
        default_active_trait_ids: form.value.traits,
        agent_profile: { trait_contexts: traitContexts.value },
        expires_at: ttlDays > 0 ? Math.floor(Date.now() / 1000) + ttlDays * 86400 : undefined,
      })
      minted.value = result
      host.toast({ severity: 'success', summary: 'Credential created', detail: result.label || result.token_prefix })
      await reload()
    } catch (e) {
      formError.value = errMsg(e, 'create failed')
    } finally { saving.value = false }
  }

  return {
    createOpen, saving, formError, minted, form, whitelist, crumbs,
    children, browsing, serverMcpUrl, browserOrigin, mcpUrl, snippet, claudeCodeCmd,
    traitPickerValue,
    openCreate, closeCreate, browse, crumbTo, crumbRoot, openFolder, currentFolder,
    inWhitelist, atRoot, scopeActive, scopeLabel, addScope, toggleWhitelist,
    removeWhitelist, classIcon, onTraitPickerChange, submit,
  }
}

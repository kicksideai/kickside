import { computed, ref, type Ref } from 'vue'
import { type HubModuleListItem } from '../keeper-hub.ts'
import { keeperHub } from '../keeper-hub.ts'
import { moduleComponent, moduleIsPrivate, moduleLabel, moduleMatchesComponent, resolvedDependencyVersion } from '../lib.ts'
import { ENTRY_KIND_META, entryGroupKey, logError } from './modules-page-utils.ts'
import type { HubVersionItem, InstalledRow, PluginDetail, RegistryEntry } from './modules-page.types.ts'

interface ModuleDetailsOptions {
  hub: ReturnType<typeof keeperHub>
  installed: Ref<InstalledRow[]>
  catalog: Ref<HubModuleListItem[]>
  installedDepFor: (component: string) => InstalledRow | undefined
  installedCanUpdate: (dep?: InstalledRow | null) => boolean
  installedUpdateDisabledReason: (dep: InstalledRow) => string
  installedCanUninstall: (dep?: InstalledRow | null) => boolean
  installedIsPrivate: (dep: InstalledRow) => boolean
}

export function useModuleDetails({ hub, installed, catalog, installedDepFor, installedCanUpdate, installedUpdateDisabledReason, installedCanUninstall, installedIsPrivate }: ModuleDetailsOptions) {
const selected = ref<PluginDetail | null>(null)
const selectedModule = ref<HubModuleListItem | null>(null)
const detailReadme = ref('')
const detailEntries = ref<RegistryEntry[]>([])
const detailLoading = ref(false)
const detailTab = ref<'readme' | 'overview' | 'versions'>('readme')
const detailVersions = ref<HubVersionItem[]>([])
const envVars = computed(() => detailEntries.value.filter(e => e.kind === 'env.variable'))
const requirements = computed(() => detailEntries.value.filter(e => e.kind === 'ns.requirement'))
const detailGroups = computed(() => {
  const map: Record<string, RegistryEntry[]> = {}
  for (const e of detailEntries.value) {
    if (e.kind === 'env.variable' || e.kind === 'ns.requirement') continue
    const k = entryGroupKey(e)
    ;(map[k] ||= []).push(e)
  }
  return Object.entries(map)
    .map(([key, items]) => ({
      key,
      label: ENTRY_KIND_META[key]?.label || key,
      icon: ENTRY_KIND_META[key]?.icon || 'tabler:point',
      items,
    }))
    .sort((a, b) => b.items.length - a.items.length)
})
const versionMeta = computed<HubVersionItem | undefined>(() =>
  detailVersions.value.find(v => v.version === selected.value?.version) || detailVersions.value[0])
const selectedInstalledDep = computed(() => selected.value ? installedDepFor(selected.value.component) : undefined)
const selectedCanUpdate = computed(() => Boolean(selectedInstalledDep.value && installedCanUpdate(selectedInstalledDep.value)))
const selectedUpdateDisabledReason = computed(() =>
  selectedInstalledDep.value && !installedCanUpdate(selectedInstalledDep.value)
    ? installedUpdateDisabledReason(selectedInstalledDep.value)
    : '')
const selectedCanUninstall = computed(() => Boolean(selectedInstalledDep.value && installedCanUninstall(selectedInstalledDep.value)))
const selectedIsPrivate = computed(() =>
  moduleIsPrivate(selectedModule.value) || Boolean(selectedInstalledDep.value && installedIsPrivate(selectedInstalledDep.value)))

async function loadEntriesFor(component: string): Promise<RegistryEntry[]> {
  try {
    const current = installed.value.find(dep => dep.component === component)
    if (current?.entries) return current.entries as RegistryEntry[]

    const result = await hub!.listDependencies({ component, includeMigrations: false })
    const dependency = (result.dependencies || []).find(dep => dep.component === component)
    return (dependency?.entries || []) as RegistryEntry[]
  } catch (e: unknown) {
    logError('modules:entries', e)
    return []
  }
}

async function findModule(component: string, passed?: HubModuleListItem): Promise<HubModuleListItem> {
  if (passed && passed.full_name) return passed
  const inCat = catalog.value.find(c => moduleMatchesComponent(c, component))
  if (inCat) return inCat
  try {
    const name = component.split('/').pop() || component
    const res = await hub.browseModules({ query: name, pageSize: 50 })
    const hit = (res.items || []).find(it => moduleMatchesComponent(it, component))
    if (hit) return hit
  } catch { /* fall through to a minimal item */ }
  return { full_name: component, component, latest_version: '', type: 'library' }
}

async function openDetail(m: HubModuleListItem | InstalledRow) {
  const component = 'component' in m && typeof m.component === 'string' && !('full_name' in m)
    ? m.component
    : moduleComponent(m as HubModuleListItem)
  const dep = installedDepFor(component)
  const passed = ('full_name' in m) ? (m as HubModuleListItem) : undefined
  selected.value = {
    component,
    label: passed ? moduleLabel(passed) : component,
    description: passed?.description || '',
    version: dep ? resolvedDependencyVersion(dep) : String(passed?.latest_version || ''),
    installed: !!dep,
    installedId: dep?.id,
  }
  selectedModule.value = passed || null
  detailReadme.value = ''
  detailEntries.value = []
  detailVersions.value = []
  detailTab.value = 'readme'
  detailLoading.value = true
  try {
    const [mod, readme, entries, versions] = await Promise.all([
      findModule(component, passed),
      hub.getReadme(component).then(r => r.content || '').catch(() => ''),
      dep ? loadEntriesFor(component) : Promise.resolve([] as RegistryEntry[]),
      hub.listVersions(component).then(r => (r.items || []) as HubVersionItem[]).catch(() => [] as HubVersionItem[]),
    ])
    selectedModule.value = mod
    detailReadme.value = readme
    detailEntries.value = entries
    detailVersions.value = versions
    if (selected.value) {
      selected.value = {
        ...selected.value,
        label: moduleLabel(mod),
        description: mod.description || selected.value.description,
        version: dep ? resolvedDependencyVersion(dep) : String(mod.latest_version || selected.value.version),
      }
    }
    if (!readme) detailTab.value = 'overview'
  } finally {
    detailLoading.value = false
  }
}

function closeDetail() {
  selected.value = null
}

async function refreshSelectedDetail() {
  if (!selected.value) return
  const c = selected.value.component
  const dep = installedDepFor(c)
  selected.value = {
    ...selected.value,
    installed: !!dep,
    installedId: dep?.id,
    version: dep ? resolvedDependencyVersion(dep) : selected.value.version,
  }
  detailEntries.value = dep ? await loadEntriesFor(c) : []
}


  return {
    selected, selectedModule, detailReadme, detailEntries, detailLoading, detailTab, detailVersions,
    envVars, requirements, detailGroups, versionMeta, selectedInstalledDep, selectedCanUpdate,
    selectedUpdateDisabledReason, selectedCanUninstall, selectedIsPrivate,
    loadEntriesFor, findModule, openDetail, closeDetail, refreshSelectedDetail,
  }
}

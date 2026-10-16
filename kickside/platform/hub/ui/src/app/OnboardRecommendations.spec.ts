import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api as proxyApi } from '@wippy-fe/proxy'
import OnboardRecommendations from './OnboardRecommendations.vue'

const emittedToHost = vi.hoisted(() => vi.fn())
vi.mock('../constants.ts', () => ({ useComponentEvents: () => emittedToHost }))

const INSTALL_URL = '/api/v1/keeper/hub/dependencies/install'
const PLAN_URL = '/api/v1/keeper/hub/dependencies/plan'

interface AssistedRequest {
  need?: string
  candidate_ids?: string[]
  candidates?: Array<{ component: string; title: string; description: string; keywords: string[] }>
  workspace_context?: {
    configured_components?: Array<{ component: string; title?: string; version?: string; relationship: string }>
  }
  accept?: () => void
  respond?: (result: unknown) => void
}

interface InstallRequest {
  component: string
  migration_policy?: string
  dry_run?: boolean
  parameters?: Array<{ name: string; value: string }>
}

function makeApi(installedSeed = ['kickside/core', 'chestor/workspace', 'kickside/knowledge', 'kickside/kb10']) {
  const installedModules = new Set(installedSeed)
  const installFailures = new Map<string, { remaining: number; message: string }>()
  const planBlockers = new Map<string, string[]>()
  const delayedInstalls = new Map<string, { promise: Promise<void>; release: () => void }>()
  let browseFailure: Error | null = null

  const browse: Record<string, any[]> = {
    kickside: [
      { full_name: 'kickside/core', display_name: 'Core', type: 'plugin', description: 'installed root', keywords: ['kickside'] },
      { full_name: 'chestor/workspace', display_name: 'Workspace', type: 'plugin', description: 'installed transitive', keywords: ['kickside'] },
      { full_name: 'kickside/knowledge', display_name: 'Knowledge', type: 'plugin', description: 'Ground agents in documents', keywords: ['kickside', 'knowledge'], total_downloads: 20, latest_version: '0.2.0' },
      { full_name: 'kickside/kb10', display_name: 'Knowledge Graph Engine', type: 'plugin', description: 'Graph knowledge store', keywords: ['kickside', 'knowledge', 'graph'], total_downloads: 18, latest_version: '0.1.10' },
      { full_name: 'kickside/memory', display_name: 'Memory', type: 'plugin', description: 'Long-term agent memory', keywords: ['kickside', 'knowledge', 'memory'], total_downloads: 12, latest_version: '0.1.2' },
      { full_name: 'kickside/webscout', display_name: 'Webscout', type: 'plugin', description: 'Grounded web research', keywords: ['kickside', 'research'], total_downloads: 11, latest_version: '0.1.7' },
      { full_name: 'kickside/llm-ocr', display_name: 'LLM OCR', type: 'application', description: 'Vision OCR provider', keywords: ['kickside', 'provider'], total_downloads: 9, latest_version: '0.1.4' },
      { full_name: 'kickside/code-execution', display_name: 'Code Execution', type: 'plugin', description: 'Agent-assisted code execution', keywords: ['kickside', 'engineering'], total_downloads: 10, latest_version: '0.1.3' },
      { full_name: 'kickside/blocks', display_name: 'Blocks', type: 'plugin', description: 'Reusable workflow blocks', keywords: ['kickside', 'automation'], total_downloads: 13, latest_version: '0.1.2' },
      { full_name: 'kickside/workflows', display_name: 'Workflows', type: 'plugin', description: 'Visual workflow automation', keywords: ['kickside', 'automation'], total_downloads: 14, latest_version: '0.1.0' },
      { full_name: 'kickside/webhooks', display_name: 'Webhooks', type: 'plugin', description: 'Webhook automation triggers', keywords: ['kickside', 'automation'], total_downloads: 8, latest_version: '0.1.3' },
      { full_name: 'community/tools', display_name: 'Community Tools', type: 'plugin', description: 'Agent helpers', keywords: ['kickside', 'agents'], total_downloads: 30 },
      { full_name: 'kickside/app', display_name: 'Another App', type: 'application', keywords: ['kickside'] },
      { full_name: 'kickside/old', display_name: 'Old', type: 'plugin', deprecated: true, keywords: ['kickside'] },
    ],
    'kickside-plugin': [],
    acme: [
      { full_name: 'acme/private-crm', display_name: 'Private CRM', type: 'plugin', visibility: 'private', description: 'Internal customer records', keywords: ['crm'] },
    ],
    crm: [
      { full_name: 'acme/crm', display_name: 'CRM', type: 'plugin', description: 'Customer records', keywords: ['kickside', 'crm'] },
    ],
    knowledge: [],
    workspace: [
      { full_name: 'chestor/workspace', display_name: 'Workspace', type: 'plugin', description: 'Organize files, links, and components', keywords: ['workspace'] },
    ],
    graph: [
      { full_name: 'chestor/graph', display_name: 'Graph Explorer', type: 'plugin', description: 'Explore connected project data', keywords: ['graph'] },
    ],
    'db-schema': [
      { full_name: 'chestor/db-schema', display_name: 'Database Schema Explorer', type: 'plugin', description: 'Explore database schemas', keywords: ['database', 'schema'] },
    ],
  }

  const registryProfiles = [
    { id: 'app.composition:onboarding_profile.knowledge', kind: 'registry.entry', meta: { type: 'kickside.hub:onboarding_profile' }, data: { profile: 'knowledge', title: 'Knowledge base', description: 'Knowledge and KB10', icon: 'tabler:brain', order: 10, required: true, packages: [{ component: 'kickside/knowledge', parameters: [{ name: 'kickside.knowledge:api_router', value: 'app:api' }, { name: 'kickside.knowledge:ui_server', value: 'app:gateway' }, { name: 'kickside.knowledge.security:user_security_scope', value: 'app.security:user' }] }, { component: 'kickside/kb10', parameters: [{ name: 'kickside.kb10:api_router', value: 'app:api' }, { name: 'kickside.kb10:ui_server', value: 'app:gateway' }, { name: 'kickside.kb10:target_db', value: 'app:db' }, { name: 'kickside.kb10:process_host', value: 'app:processes' }] }] } },
    { id: 'app.composition:onboarding_profile.workspace', kind: 'registry.entry', meta: { type: 'kickside.hub:onboarding_profile' }, data: { profile: 'workspace', title: 'Workspace & Graphs', description: 'Workspace and technical explorers', icon: 'tabler:layout-sidebar', order: 20, packages: [{ component: 'chestor/workspace', parameters: [{ name: 'chestor.workspace:api_router', value: 'app:api' }, { name: 'chestor.workspace:ui_server', value: 'app:gateway' }] }, { component: 'chestor/graph', parameters: [{ name: 'chestor.graph:target_db', value: 'app:db' }, { name: 'chestor.graph:api_router', value: 'app:api' }, { name: 'chestor.graph:ui_server', value: 'app:gateway' }] }, { component: 'chestor/db-schema', parameters: [{ name: 'chestor.db_schema:target_db', value: 'app:db' }, { name: 'chestor.db_schema:api_router', value: 'app:api' }, { name: 'chestor.db_schema:ui_server', value: 'app:gateway' }] }] } },
    { id: 'app.composition:onboarding_profile.automation', kind: 'registry.entry', meta: { type: 'kickside.hub:onboarding_profile' }, data: { profile: 'automation', title: 'Automations', description: 'Automation execution and triggers', icon: 'tabler:bolt', order: 30, packages: [{ component: 'kickside/code-execution', parameters: [{ name: 'kickside.code_execution:api_router', value: 'app:api' }, { name: 'kickside.code_execution:ui_server', value: 'app:gateway' }] }, { component: 'kickside/webhooks' }] } },
    { id: 'app.composition:onboarding_profile.workflows', kind: 'registry.entry', meta: { type: 'kickside.hub:onboarding_profile' }, data: { profile: 'workflows', title: 'Visual Workflows', description: 'Blocks and visual composer', icon: 'tabler:route', order: 40, packages: [{ component: 'kickside/code-execution', parameters: [{ name: 'kickside.code_execution:api_router', value: 'app:api' }, { name: 'kickside.code_execution:ui_server', value: 'app:gateway' }] }, { component: 'kickside/blocks', parameters: [{ name: 'kickside.blocks:process_host', value: 'app:processes' }] }, { component: 'kickside/workflows', parameters: [{ name: 'kickside.workflows:target_db', value: 'app:db' }, { name: 'kickside.workflows:api_router', value: 'app:api' }, { name: 'kickside.workflows:ui_server', value: 'app:gateway' }, { name: 'kickside.workflows:process_host', value: 'app:processes' }, { name: 'kickside.workflows.security:user_security_scope', value: 'app.security:user' }] }] } },
    { id: 'app.composition:onboarding_profile.research', kind: 'registry.entry', meta: { type: 'kickside.hub:onboarding_profile' }, data: { profile: 'research', title: 'Web Research', description: 'Grounded web search', icon: 'tabler:world-search', order: 50, packages: [{ component: 'kickside/webscout' }] } },
  ]

  const get = vi.fn((url: string, config?: { params?: Record<string, unknown> }) => {
    if (url === '/api/v1/security/projection') return Promise.resolve({ data: { current: true }, status: 200 })
    if (url === '/api/v1/hub/auth') {
      return Promise.resolve({ data: { success: true, authenticated: true, orgs: [{ name: 'acme', display_name: 'Acme Team' }] }, status: 200 })
    }
    if (url === '/api/v1/keeper/registry/entries') {
      return Promise.resolve({ data: {
        success: true,
        entries: registryProfiles.map(({ id, kind, meta }) => ({ id, kind, meta })),
      }, status: 200 })
    }
    if (url === '/api/v1/keeper/registry/entry') {
      return Promise.resolve({ data: {
        success: true,
        entry: registryProfiles.find(row => row.id === config?.params?.id),
      }, status: 200 })
    }
    if (url === '/api/v1/keeper/hub/dependencies') {
      return Promise.resolve({ data: {
        success: true,
        dependencies: Array.from(installedModules).map((component, index) => ({
          id: `app.deps:dep${index}`,
          component,
          installed: true,
          is_root: component !== 'chestor/workspace',
        })),
        modules: Array.from(installedModules).map(name => ({
          name,
          version: name === 'kickside/core' ? '0.1.18' : '0.1.4',
          is_root: name !== 'chestor/workspace',
          transitive: name === 'chestor/workspace',
          used_by: name === 'chestor/workspace' ? ['kickside/core'] : [],
        })),
      }, status: 200 })
    }
    if (url === '/api/v1/keeper/hub/browse') {
      if (browseFailure) return Promise.reject(browseFailure)
      const query = String(config?.params?.q || '')
      const items = browse[query] || []
      return Promise.resolve({ data: { success: true, items, total: items.length, page: 1, page_size: 100 }, status: 200 })
    }
    return Promise.resolve({ data: { success: true }, status: 200 })
  })

  const post = vi.fn(async (url: string, body?: unknown) => {
    if (url === PLAN_URL) {
      const component = String((body as { component?: unknown })?.component || '')
      const blockers = planBlockers.get(component) || []
      return {
        data: {
          success: true,
          missing_requirements: blockers,
          requirements: blockers.map(full_id => ({ full_id, missing: true })),
        },
        status: 200,
      }
    }
    if (url !== INSTALL_URL) return { data: { success: true }, status: 200 }
    const component = String((body as { component?: unknown })?.component || '')
    const failure = installFailures.get(component)
    if (failure?.remaining) {
      failure.remaining--
      throw new Error(failure.message)
    }
    const delayed = delayedInstalls.get(component)
    if (delayed) {
      delayedInstalls.delete(component)
      await delayed.promise
    }
    installedModules.add(component)
    return { data: { success: true, dependency: { id: `app.deps:${component}`, component } }, status: 200 }
  })

  return {
    api: {
      get,
      post,
      delete: vi.fn(() => Promise.resolve({ data: { success: true }, status: 200 })),
    },
    addCatalog(query: string, item: any) { (browse[query] ||= []).push(item) },
    failBrowse(message: string) { browseFailure = new Error(message) },
    failInstall(component: string, message: string, times = 1) {
      installFailures.set(component, { remaining: times, message })
    },
    blockPlan(component: string, requirements: string[]) {
      planBlockers.set(component, requirements)
    },
    delayInstall(component: string) {
      let release!: () => void
      const promise = new Promise<void>(resolve => { release = resolve })
      delayedInstalls.set(component, { promise, release })
      return release
    },
  }
}

function installApi(fake: ReturnType<typeof makeApi>['api']) {
  ;(proxyApi.get as any).mockImplementation(fake.get)
  ;(proxyApi.post as any).mockImplementation(fake.post)
  ;(proxyApi.delete as any).mockImplementation(fake.delete)
}

function installCalls(fake: ReturnType<typeof makeApi>): InstallRequest[] {
  return (fake.api.post as any).mock.calls
    .filter((call: any[]) => call[0] === INSTALL_URL)
    .map((call: any[]) => call[1] as InstallRequest)
}

async function chooseOwn(wrapper: ReturnType<typeof mount>) {
  const recommend = wrapper.findAll('.obm-profile-card.custom').find(card => card.text().includes('Recommend packages'))
  await recommend!.trigger('click')
  await flushPromises()
}

async function browsePackages(wrapper: ReturnType<typeof mount>) {
  const browse = wrapper.findAll('.obm-profile-card.custom').find(card => card.text().includes('Browse packages'))
  await browse!.trigger('click')
  await flushPromises()
}

function packageCard(wrapper: ReturnType<typeof mount>, component: string) {
  return wrapper.findAll('.obm-package-row').find(row => row.find('code').text() === component)!
}

describe('Hub onboarding recommendations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    emittedToHost.mockReset()
    emittedToHost.mockImplementation(() => {})
  })

  it('loads a multi-select capability menu and installs the reviewed combined queue once', async () => {
    const fake = makeApi()
    installApi(fake.api)
    const wrapper = mount(OnboardRecommendations, { global: { stubs: { Icon: true } } })
    await flushPromises()

    expect((fake.api.get as any).mock.calls).toContainEqual([
      '/api/v1/keeper/registry/entries',
      { params: { kind: 'registry.entry', 'meta.type': 'kickside.hub:onboarding_profile', limit: 100 } },
    ])
    expect(wrapper.findAll('.obm-profile-card')).toHaveLength(7)
    expect(wrapper.findAll('.obm-menu-section')).toHaveLength(3)
    expect(wrapper.findAll('.obm-profile-packages')).toHaveLength(5)
    expect(wrapper.text()).toContain('Knowledge base')
    expect(wrapper.text()).toContain('Workspace & Graphs')
    expect(wrapper.text()).toContain('Automations')
    expect(wrapper.text()).toContain('Visual Workflows')
    expect(wrapper.text()).toContain('Web Research')
    expect(wrapper.text()).not.toContain('Choose individual packages')
    expect(wrapper.findAll('.obm-profile-card.custom')).toHaveLength(2)
    expect(wrapper.find('.obm-profile-card.required').exists()).toBe(true)

    const workspace = wrapper.findAll('.obm-profile-card').find(card => card.find('.obm-profile-title').text() === 'Workspace & Graphs')!
    const research = wrapper.findAll('.obm-profile-card').find(card => card.find('.obm-profile-title').text() === 'Web Research')!
    expect(research.text()).not.toContain('unavailable in this catalog')
    await workspace.trigger('click')
    await research.trigger('click')
    await flushPromises()

    expect(installCalls(fake)).toEqual([])
    expect(wrapper.find('.obm-selection-items').element.tagName).toBe('UL')
    expect(wrapper.findAll('.obm-selection-items > li').map(item => item.find('small').text())).toEqual([
      'chestor/graph',
      'chestor/db-schema',
      'kickside/webscout',
    ])
    expect(wrapper.find('.obm-continue').exists()).toBe(false)

    await wrapper.get('.obm-queue-retry').trigger('click')
    await flushPromises()
    expect(installCalls(fake).map(call => call.component)).toEqual([
      'chestor/graph',
      'chestor/db-schema',
      'kickside/webscout',
    ])
    expect(wrapper.get('[role="progressbar"]').attributes('aria-valuenow')).toBe('100')
    expect(wrapper.findAll('.obm-queue-items > li').every(item => item.classes().includes('is-installed'))).toBe(true)
    expect(wrapper.text()).toContain('3 modules added to this workspace')
    expect(wrapper.get<HTMLButtonElement>('.obm-continue').element.disabled).toBe(false)

    await wrapper.get('.obm-continue').trigger('click')
    expect(emittedToHost).toHaveBeenCalledWith('done', {
      status: 'completed',
      installed_count: 3,
      profiles: ['knowledge', 'workspace', 'research'],
    })
    expect((fake.api.post as any).mock.calls.every((call: any[]) => [PLAN_URL, INSTALL_URL].includes(call[0]))).toBe(true)
    expect((fake.api.post as any).mock.calls.filter((call: any[]) => call[0] === PLAN_URL)).toHaveLength(3)
    expect(installCalls(fake).every(call => call.dry_run === undefined)).toBe(true)
    wrapper.unmount()
  })

  it('installs selected Knowledge and KB10 in order with their app-owned parameters', async () => {
    const fake = makeApi(['kickside/core'])
    installApi(fake.api)
    const wrapper = mount(OnboardRecommendations, { global: { stubs: { Icon: true } } })
    await flushPromises()

    expect(installCalls(fake)).toEqual([])
    expect(wrapper.findAll('.obm-selection-items > li')).toHaveLength(2)
    const knowledge = wrapper.findAll('.obm-profile-card').find(card => card.find('.obm-profile-title').text() === 'Knowledge base')!
    expect(knowledge.element.tagName).toBe('DIV')
    expect(knowledge.text()).toContain('Included')
    expect(wrapper.findAll('.obm-selection-items > li').map(item => item.find('small').text())).toEqual(['kickside/knowledge', 'kickside/kb10'])
    await wrapper.get('.obm-queue-retry').trigger('click')
    await flushPromises()

    expect(installCalls(fake).slice(0, 2)).toEqual([
      {
        component: 'kickside/knowledge',
        migration_policy: 'up',
        parameters: [
          { name: 'kickside.knowledge:api_router', value: 'app:api' },
          { name: 'kickside.knowledge:ui_server', value: 'app:gateway' },
          { name: 'kickside.knowledge.security:user_security_scope', value: 'app.security:user' },
        ],
      },
      {
        component: 'kickside/kb10',
        migration_policy: 'up',
        parameters: [
        { name: 'kickside.kb10:api_router', value: 'app:api' },
        { name: 'kickside.kb10:ui_server', value: 'app:gateway' },
        { name: 'kickside.kb10:target_db', value: 'app:db' },
        { name: 'kickside.kb10:process_host', value: 'app:processes' },
        ],
      },
    ])
  })

  it('keeps Automations and Visual Workflows separate and de-duplicates selected roots', async () => {
    const fake = makeApi()
    installApi(fake.api)
    const wrapper = mount(OnboardRecommendations, { global: { stubs: { Icon: true } } })
    await flushPromises()

    const automation = wrapper.findAll('.obm-profile-card').find(card => card.find('.obm-profile-title').text() === 'Automations')!
    const workflows = wrapper.findAll('.obm-profile-card').find(card => card.find('.obm-profile-title').text() === 'Visual Workflows')!
    await automation.trigger('click')
    await workflows.trigger('click')
    await flushPromises()

    expect(installCalls(fake)).toEqual([])
    expect(wrapper.findAll('.obm-selection-items > li').map(item => item.find('small').text())).toEqual([
      'kickside/code-execution',
      'kickside/webhooks',
      'kickside/blocks',
      'kickside/workflows',
    ])
    await wrapper.get('.obm-queue-retry').trigger('click')
    await flushPromises()
    expect(installCalls(fake).map(call => call.component)).toEqual([
      'kickside/code-execution',
      'kickside/webhooks',
      'kickside/blocks',
      'kickside/workflows',
    ])
    expect(installCalls(fake).filter(call => call.component === 'kickside/code-execution')).toEqual([{
      component: 'kickside/code-execution',
      migration_policy: 'up',
      parameters: [
        { name: 'kickside.code_execution:api_router', value: 'app:api' },
        { name: 'kickside.code_execution:ui_server', value: 'app:gateway' },
      ],
    }])
  })








})

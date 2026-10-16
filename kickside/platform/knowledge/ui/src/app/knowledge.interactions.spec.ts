import { describe, it, expect, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api, on } from '@wippy-fe/proxy'
import Knowledge from './knowledge.vue'
import Onboard from './Onboard.vue'
beforeEach(() => {
  ;(globalThis as any).__props__ = { config: {} }
  ;(globalThis as any).__realtimeHandlers__ = []
  ;(globalThis as any).__api__ = {
    '/knowledge/list': { success: true, items: [
      { id: 'kb1', name: 'Docs KB', kb_type: 'document', document_count: 3 },
      { id: 'kb2', name: 'Wiki KB', kb_type: 'wiki' },
    ] },
    '/knowledge/models': { success: true, models: [{ id: 'm', name: 'Embed' }] },
    '/knowledge/engines': { success: true, engines: [
      {
        kb_type: 'document',
        label: 'Document',
        description: 'Files and pages chunked, embedded, and retrieved by semantic search.',
        badge: { label: 'Document', icon: 'tabler:files', tone: 'neutral' },
        stats_spec: [{ path: 'document_count', icon: 'tabler:file-text', singular: 'document', plural: 'documents', min: 1 }],
        create_ui_id: 'kx-kb-create',
        manage_ui_id: 'kx-kb-document',
      },
      {
        kb_type: 'wiki',
        label: 'Wiki',
        description: 'A concept graph with a fixed default link depth.',
        badge: { label: 'Wiki', icon: 'tabler:notebook', tone: 'help' },
        stats_spec: [{ path: 'concept_count', icon: 'tabler:topology-star-3', singular: 'concept', plural: 'concepts', min: 1 }],
        create_ui_id: 'kx-kb-create',
        manage_ui_id: 'kx-kb-wiki',
      },
    ] },
  }
})
describe('knowledge.vue interactions', () => {
  it('lists KBs and filters via search', async () => {
    const w = mount(Knowledge)
    await flushPromises()
    expect(w.html()).toContain('Docs KB')
    const s = w.find('input[type=search], input[type=text], input')
    if (s.exists()) { await s.setValue('wiki'); await flushPromises() }
    w.unmount()
  })

  it('patches KB rows from component public meta realtime', async () => {
    const w = mount(Knowledge)
    await flushPromises()
    ;(globalThis as any).__emitRealtime__({
      topic: 'component.kb1',
      data: {
        event: 'component.meta.changed',
        component_id: 'kb1',
        meta: {
          title: 'Renamed KB',
          kb_type: 'document',
          document_count: '4',
          embedding_count: '12',
        },
      },
    })
    await flushPromises()
    expect(w.text()).toContain('Renamed KB')
    expect(w.text()).toContain('4')
    w.unmount()
  })

  it('keeps existing counters when realtime carries status-only meta', async () => {
    const w = mount(Knowledge)
    await flushPromises()

    ;(globalThis as any).__emitRealtime__({
      topic: 'component.kb1',
      data: {
        event: 'component.meta.changed',
        component_id: 'kb1',
        meta: {
          kb_type: 'document',
          document_count: '3',
        },
      },
    })
    await flushPromises()
    expect(w.text()).toContain('3')

    ;(globalThis as any).__emitRealtime__({
      topic: 'component.kb1',
      data: {
        event: 'component.meta.changed',
        component_id: 'kb1',
        meta: { status: 'error', last_error: 'failed to get upload content' },
      },
    })
    await flushPromises()

    expect(w.text()).toContain('3')
    expect(w.text()).not.toContain('0 documents')
    w.unmount()
  })

  it('shows both document and wiki engine choices in the create dialog', async () => {
    const w = mount(Knowledge)
    await flushPromises()

    const create = w.find('[data-testid="knowledge-create"]')
    expect(create.exists()).toBe(true)
    await create.trigger('click')
    await flushPromises()

    const typeNames = w.findAll('.kx-cat-name').map(n => n.text())
    expect(typeNames).toContain('Document')
    expect(typeNames).toContain('Wiki')
    expect(w.findAll('.kx-cat-card').length).toBeGreaterThanOrEqual(2)
    w.unmount()
  })

  it('keeps a large engine catalog searchable inside the create dialog', async () => {
    ;(globalThis as any).__api__['/knowledge/engines'] = {
      success: true,
      engines: [
        ...(globalThis as any).__api__['/knowledge/engines'].engines,
        ...Array.from({ length: 12 }, (_, i) => ({
          kb_type: `custom_${i}`,
          label: `Custom ${i}`,
          description: `Synthetic engine ${i}`,
          create_ui_id: 'kx-kb-create',
          manage_ui_id: 'kx-kb-document',
        })),
      ],
    }

    const w = mount(Knowledge)
    await flushPromises()
    await w.find('[data-testid="knowledge-create"]').trigger('click')
    await flushPromises()

    expect(w.findAll('.kx-cat-card').length).toBe(14)
    const search = w.find('input[aria-label="Search knowledge base types"]')
    expect(search.exists()).toBe(true)

    await search.setValue('wiki')
    await flushPromises()

    const typeNames = w.findAll('.kx-cat-name').map(n => n.text())
    expect(typeNames).toEqual(['Wiki'])
    w.unmount()
  })
})

describe('knowledge onboarding upload status', () => {
  it('uses uploads component meta realtime as invalidation instead of polling', async () => {
    const apiMock = api as unknown as {
      get: { mockClear: () => void; mock: { calls: unknown[][] } }
      post: { mockClear: () => void }
    }
    const onMock = on as unknown as { mockClear: () => void; mock: { calls: unknown[][] } }
    apiMock.get.mockClear()
    apiMock.post.mockClear()
    onMock.mockClear()

    ;(globalThis as any).__api__ = {
      '/api/v1/uploads/u1': {
        success: true,
        component_id: 'uploads-u1',
        upload: { uuid: 'u1', status: 'processing' },
      },
      '/api/v1/uploads': { success: true, uuid: 'u1', component_id: 'uploads-u1' },
    }

    const w = mount(Onboard)
    const file = new File(['hello'], 'hello.md', { type: 'text/markdown' })
    await w.find('.kn-drop').trigger('drop', { dataTransfer: { files: [file] } })
    await flushPromises()

    expect(onMock.mock.calls.some(([topic]) => topic === 'component.uploads-u1')).toBe(true)
    expect(apiMock.get.mock.calls.length).toBe(1)
    expect(w.text()).toContain('Processing')

    ;(globalThis as any).__api__['/api/v1/uploads/u1'] = {
      success: true,
      component_id: 'uploads-u1',
      upload: { uuid: 'u1', status: 'completed' },
    }
    ;(globalThis as any).__emitRealtime__({
      topic: 'component.uploads-u1',
      data: {
        event: 'component.meta.changed',
        component_id: 'uploads-u1',
        meta: { file_count: 1, pending_count: 0 },
      },
    })
    await flushPromises()

    expect(apiMock.get.mock.calls.length).toBe(2)
    expect(w.text()).toContain('Build knowledge base (1)')
    w.unmount()
  })
})

describe('knowledge.vue detail + create', () => {
  beforeEach(() => {
    ;(globalThis as any).__api__['/knowledge/kb1'] = { success: true, id: 'kb1', name: 'Docs KB', kb_type: 'document' }
  })
  it('opens a KB detail and the create dialog', async () => {
    const w = mount(Knowledge)
    await flushPromises()
    // open create
    const create = w.find('[data-testid="knowledge-create"]')
    if (create.exists()) { await create.trigger('click'); await flushPromises() }
    // open a KB card detail
    const card = w.find('.kx-card, [aria-label^=Open], .kx-kb')
    if (card.exists()) { await card.trigger('click'); await flushPromises() }
    expect(w.exists()).toBe(true)
    w.unmount()
  })

  it('does not open edit from partial list data when the full record fails to load', async () => {
    ;(globalThis as any).__api__['/knowledge/kb1'] = { success: false, error: 'settings unavailable' }
    const w = mount(Knowledge)
    await flushPromises()

    const edit = w.find('button[aria-label="Edit Docs KB"]')
    expect(edit.exists()).toBe(true)
    await edit.trigger('click')
    await flushPromises()

    expect(w.text()).toContain('settings unavailable')
    expect(w.text()).not.toContain('Edit knowledge base')
    w.unmount()
  })

  it('patches the detail header from component meta realtime', async () => {
    ;(globalThis as any).__api__['/knowledge/engines'] = {
      success: true,
      engines: [{ kb_type: 'document', label: 'Document', manage_ui_id: 'kx-test-manage' }],
    }
    const w = mount(Knowledge)
    await flushPromises()

    await w.find('.kx-card').trigger('click')
    await flushPromises()
    const engineEl = w.element.querySelector('kx-test-manage')
    expect(engineEl).toBeTruthy()

    engineEl?.dispatchEvent(new CustomEvent('kb-changed'))
    ;(globalThis as any).__emitRealtime__({
      topic: 'component.kb1',
      data: {
        event: 'component.meta.changed',
        component_id: 'kb1',
        meta: {
          title: 'Renamed Docs',
          kb_type: 'document',
          document_count: 4,
        },
      },
    })
    await flushPromises()

    expect(w.text()).toContain('Renamed Docs')
    w.unmount()
  })
})

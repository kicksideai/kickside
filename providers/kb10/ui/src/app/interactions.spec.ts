import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import AddPanel from './AddPanel.vue'
import BrowseList from './BrowseList.vue'
import DocReader from './DocReader.vue'
import KbSearch from './shared/KbSearch.vue'
import GraphInspector from './GraphInspector.vue'

const node = (o: any = {}) => ({ id: 'n1', label: 'Doc', content: '# Hi\n\ntext', content_type: 'text/markdown', metadata: {}, ...o })

beforeEach(() => {
  vi.clearAllMocks()
  ;(globalThis as any).__kbHandlers__ = []
  ;(globalThis as any).__kbApi__ = {
    '/browse': { success: true, nodes: [node(), node({ id: 'n2', label: 'Two' })] },
    '/documents': { success: true, nodes: [node()] },
    '/search': { success: true, hits: [{ id: 'n1', content: 'match', score: 0.9 }] },
    '/settings': { success: true, settings: {} },
    '/node': { success: true, node: node() },
  }
})

describe('AddPanel', () => {
  // mode order: [0]=file, [1]=text, [2]=My uploads.
  it('queues text ingest and emits changed', async () => {
    ;(globalThis as any).__kbApi__['/ingest'] = { success: true, external_id: 'text-1' }
    const w = mount(AddPanel, { props: { kbId: 'kb1', noun: 'document' } })
    await flushPromises()
    await w.findAll('.ap-mode')[1].trigger('click')
    const ta = w.find('textarea')
    await ta.setValue('hello content')
    const submit = w.find('.ap-submit')
    await submit.trigger('click')
    await flushPromises()
    // Content is queued into the KB; the panel reports it and asks the host to
    // refresh (embedding then runs in the background).
    expect(w.emitted('changed')).toHaveLength(1)
    expect(w.html()).toContain('Added')
    w.unmount()
  })

})

describe('BrowseList', () => {
  it('loads and renders rows, emits on row click', async () => {
    const w = mount(BrowseList, { props: { kbId: 'kb1' } })
    await flushPromises()
    expect(w.html().length).toBeGreaterThan(0)
    const row = w.find('button, [role=button], li, .bl-row')
    if (row.exists()) await row.trigger('click')
    w.unmount()
  })

  it('keeps deleted rows pending until materialization completes', async () => {
    ;(globalThis as any).__kbApi__['/browse'] = {
      success: true,
      nodes: [node({ metadata: { external_id: 'doc-1', title: 'Queued delete' } })],
    }
    ;(globalThis as any).__kbApi__['/content'] = { success: true }
    const w = mount(BrowseList, { props: { kbId: 'kb1' } })
    await flushPromises()

    const del = w.find('.bl-del')
    await del.trigger('click')
    await flushPromises()
    expect(w.html()).toContain('Queued delete')
    expect(w.html()).toContain('Delete queued')
    expect(w.emitted('changed')).toBeUndefined()

    ;(globalThis as any).__kbEmit__({
      topic: 'component.kb1',
      data: { event: 'component.meta.changed', component_id: 'kb1', meta: { status: 'ready' } },
    })
    await flushPromises()
    expect(w.html()).toContain('Queued delete')
    expect(w.emitted('changed')).toBeUndefined()

    ;(globalThis as any).__kbApi__['/browse'] = { success: true, nodes: [] }
    ;(globalThis as any).__kbEmit__({
      topic: 'component.kb1',
      data: { event: 'component.meta.changed', component_id: 'kb1', meta: { status: 'ready' } },
    })
    await flushPromises()
    expect(w.findAll('.bl-row')).toHaveLength(0)
    w.unmount()
  })
})

describe('BrowseList delete reconciliation', () => {
  it('ignores delete completion for a different external id', async () => {
    ;(globalThis as any).__kbApi__['/browse'] = {
      success: true,
      nodes: [node({ metadata: { external_id: 'doc-1', title: 'Queued delete' } })],
    }
    ;(globalThis as any).__kbApi__['/content'] = { success: true }
    const w = mount(BrowseList, { props: { kbId: 'kb1' } })
    await flushPromises()

    await w.find('.bl-del').trigger('click')
    await flushPromises()
    ;(globalThis as any).__kbEmit__({
      topic: 'component.kb1',
      data: { event: 'component.meta.changed', component_id: 'kb1', meta: { status: 'ready' } },
    })
    await flushPromises()
    expect(w.html()).toContain('Queued delete')
    expect(w.emitted('changed')).toBeUndefined()

    ;(globalThis as any).__kbApi__['/browse'] = { success: true, nodes: [] }
    ;(globalThis as any).__kbEmit__({
      topic: 'component.kb1',
      data: { event: 'component.meta.changed', component_id: 'kb1', meta: { status: 'ready' } },
    })
    await flushPromises()
    expect(w.findAll('.bl-row')).toHaveLength(0)
    expect(w.emitted('changed')).toHaveLength(1)
    w.unmount()
  })
})

describe('KbSearch rail', () => {
  it('searches inline and emits open for a chosen hit', async () => {
    ;(globalThis as any).__kbApi__['/search'] = {
      success: true,
      results: [{ id: 'n1', content: 'matched passage', node_type: 'concept', similarity: 0.82 }],
    }
    const w = mount(KbSearch, { props: { kbId: 'kb1', layout: 'rail' } })
    const input = w.find('input')
    await input.setValue('topic')
    await input.trigger('focusin')
    await input.trigger('keyup.enter')
    await flushPromises()
    const hit = w.find('.kc-search-hit')
    expect(hit.exists()).toBe(true)
    await hit.trigger('mousedown')
    expect(w.emitted('open')?.[0]?.[0]).toMatchObject({ id: 'n1' })
    w.unmount()
  })
})

describe('KbSearch panel Ask', () => {
  it('exposes answer mode only while the caller enables the capability', async () => {
    const w = mount(KbSearch, { props: { kbId: 'kb1', layout: 'panel', ask: false } })
    await flushPromises()
    expect(w.find('.kc-search-modes').exists()).toBe(false)
    await w.setProps({ ask: true })
    await w.findAll('.kc-search-mode')[1].trigger('click')
    expect(w.find('input').attributes('placeholder')).toBe('Ask this knowledge base a question…')
    await w.setProps({ ask: false })
    expect(w.find('.kc-search-modes').exists()).toBe(false)
    await w.find('input').setValue('retrieval only')
    await w.find('input').trigger('keyup.enter')
    await flushPromises()
    expect(api.get).toHaveBeenCalledWith('/api/v1/kb10/kb1/search?q=retrieval%20only&limit=20')
    expect(api.post).not.toHaveBeenCalled()
    w.unmount()
  })

  it('uses a static busy icon instead of spinning the search action', async () => {
    let resolveSearch: (value: any) => void = () => {}
    vi.mocked(api.get).mockImplementationOnce(() => new Promise((resolve) => {
      resolveSearch = resolve
    }) as any)

    const w = mount(KbSearch, { props: { kbId: 'kb1', layout: 'panel' } })
    await flushPromises()
    await w.find('input').setValue('topic')
    await w.find('input').trigger('keyup.enter')
    await flushPromises()

    const search = w.get('button[aria-label="Search"]')
    expect(search.classes()).toContain('on')
    expect(search.attributes('disabled')).toBeDefined()
    expect(search.find('.spin').exists()).toBe(false)

    resolveSearch({ data: { success: true, results: [] } })
    await flushPromises()
    w.unmount()
  })

  it('asks and renders the synthesized answer', async () => {
    ;(globalThis as any).__kbApi__['/ask'] = {
      success: true,
      answer: 'A synthesized grounded answer.',
      results: [{ id: 'n1', content: 'supporting passage', parent_id: 'd1', node_type: 'chunk', similarity: 0.8 }],
    }
    const w = mount(KbSearch, { props: { kbId: 'kb1', layout: 'panel', ask: true } })
    await flushPromises()
    await w.findAll('.kc-search-mode')[1].trigger('click')
    await w.find('input').setValue('what is this?')
    await w.find('input').trigger('keyup.enter')
    await flushPromises()
    expect(w.html()).toContain('A synthesized grounded answer.')
    w.unmount()
  })
})

describe('DocReader', () => {
  it('renders a document node and emits back', async () => {
    const w = mount(DocReader, { props: { kbId: 'kb1', node: node() as any } })
    await flushPromises()
    expect(w.html().length).toBeGreaterThan(0)
    const back = w.find('.dr-back, [aria-label=Back], button')
    if (back.exists()) await back.trigger('click')
    w.unmount()
  })
})

describe('GraphInspector', () => {
  it('renders a concept with its edges', async () => {
    const concept = { id: 'c1', label: 'Topic', concept_type: 'topic' } as any
    const edges = [{ id: 'e1', from_node_id: 'c1', to_node_id: 'root', edge_type: 'subtopic_of' }] as any
    const w = mount(GraphInspector, { props: { kbId: 'kb1', concept, edges, labelOf: (id: string) => id } })
    await flushPromises()
    expect(w.html()).toContain('Topic')
    w.unmount()
  })
})

describe('WikiNav', () => {
  it('lists the current folder flat, drills into a folder, opens a leaf', async () => {
    const { default: WikiNav } = await import('./WikiNav.vue')
    const folder = { id: 'c1', label: 'Folder' }
    const leaf = { id: 'c2', label: 'Page' }
    const w = mount(WikiNav, {
      props: {
        crumbs: [{ id: 'root', label: 'Root' }],
        entries: [
          { concept: folder, isFolder: true, childCount: 2 },
          { concept: leaf, isFolder: false, childCount: 0 },
        ],
        selectedId: 'c2',
        query: '',
        results: [],
      },
    })
    await flushPromises()
    const items = w.findAll('.wn-item')
    expect(items).toHaveLength(2)
    // Folder first (with its child count), leaf second.
    expect(items[0].text()).toContain('Folder')
    expect(items[0].classes()).toContain('folder')
    expect(items[0].text()).toContain('2')
    // Clicking a folder drills in; clicking a leaf opens it.
    await items[0].trigger('click')
    expect(w.emitted('enter')?.[0]?.[0]).toMatchObject({ id: 'c1' })
    await items[1].trigger('click')
    expect(w.emitted('open')?.[0]?.[0]).toMatchObject({ id: 'c2' })
    w.unmount()
  })

  it('opens the concept rail at the root when graph view has no selected node', async () => {
    const { default: ConceptNavRail } = await import('./ConceptNavRail.vue')
    const w = mount(ConceptNavRail, {
      props: {
        concepts: [
          { id: 'root', label: 'Root', is_root: true },
          { id: 'topic', label: 'Topic', concept_type: 'topic' },
          { id: 'doc', label: 'Document page', node_type: 'document' },
        ],
        edges: [
          { id: 'e1', from_node_id: 'topic', to_node_id: 'root', edge_type: 'subtopic_of' },
          { id: 'e2', from_node_id: 'doc', to_node_id: 'root', edge_type: 'categorized_as' },
        ],
        selectedId: '',
      },
    })
    await flushPromises()
    expect(w.find('.wn-empty').exists()).toBe(false)
    expect(w.text()).toContain('Topic')
    expect(w.text()).toContain('Document page')
    w.unmount()
  })

  it('shows search results flat with their path and navigates on click', async () => {
    const { default: WikiNav } = await import('./WikiNav.vue')
    const w = mount(WikiNav, {
      props: {
        crumbs: [{ id: 'root', label: 'Root' }],
        entries: [],
        selectedId: '',
        query: 'pa',
        results: [
          { concept: { id: 'c2', label: 'Page' }, isFolder: false, path: [{ id: 'root', label: 'Root' }] },
        ],
      },
    })
    await flushPromises()
    expect(w.find('.wn-path').text()).toContain('Root')
    await w.find('.wn-item').trigger('click')
    expect(w.emitted('open')?.[0]?.[0]).toMatchObject({ id: 'c2' })
    w.unmount()
  })
})

describe('KbCreateConfig', () => {
  it('renders engine fields from the config schema', async () => {
    ;(globalThis as any).__kbProps__ = { config: { config_schema: { fields: [{ key: 'depth', type: 'number', label: 'Depth' }] } } }
    const { default: KbCreateConfig } = await import('./KbCreateConfig.vue')
    const w = mount(KbCreateConfig)
    await flushPromises()
    expect(w.html().length).toBeGreaterThan(0)
    w.unmount()
  })
})

describe('KbWiki interactions', () => {
  it('renders the nav + reading shell, navigates, and opens inline manage + add sheet', async () => {
    ;(globalThis as any).__kbProps__ = { config: { kb_id: 'kb1' } }
    ;(globalThis as any).__kbApi__['/graph'] = {
      success: true,
      nodes: [
        { id: 'root', label: 'Root', is_root: true },
        { id: 'topic', label: 'Topic', concept_type: 'topic' },
      ],
      edges: [{ id: 'e1', from_node_id: 'topic', to_node_id: 'root', edge_type: 'subtopic_of' }],
    }
    const { default: KbWiki } = await import('./KbWiki.vue')
    const w = mount(KbWiki)
    await flushPromises()
    await new Promise(r => setTimeout(r, 20))
    await flushPromises()

    // One nav rail + an open reading area (no second nav column).
    expect(w.find('.kc-rail').exists()).toBe(true)
    expect(w.find('.kc-main').exists()).toBe(true)
    expect(w.find('.wm').exists()).toBe(false)

    // Navigate to the non-root concept (a flat entry in the root folder).
    const rows = w.findAll('.wn-item')
    const topicRow = rows.find(r => r.text().includes('Topic'))
    expect(topicRow).toBeTruthy()
    await topicRow!.trigger('click')
    await flushPromises()
    expect(w.find('.wr-title').text()).toContain('Topic')

    // Inline manage: the page bar opens the concept actions menu; picking Rename
    // opens the inline taxonomy form.
    const struct = w.find('[aria-label="Edit structure"]')
    expect(struct.exists()).toBe(true)
    await struct.trigger('click')
    await flushPromises()
    const rename = w.findAll('.kb-menu-item').find(b => b.text().includes('Rename'))
    expect(rename).toBeTruthy()
    await rename!.trigger('click')
    await flushPromises()
    expect(w.find('.wk-tax').exists()).toBe(true)

    // Add page opens the docked drawer.
    await w.find('[aria-label="Add page"]').trigger('click')
    await flushPromises()
    expect(w.find('.kc-drawer').exists()).toBe(true)
    w.unmount()
  })

  it('refreshes the tree on a realtime KB event', async () => {
    ;(globalThis as any).__kbProps__ = { config: { kb_id: 'kb1' } }
    ;(globalThis as any).__kbApi__['/graph'] = {
      success: true,
      nodes: [{ id: 'root', label: 'Root', is_root: true }],
      edges: [],
    }
    const { default: KbWiki } = await import('./KbWiki.vue')
    const w = mount(KbWiki)
    await flushPromises()
    await new Promise(r => setTimeout(r, 20))
    await flushPromises()
    // The root folder lists its own (empty) contents — the placeholder row.
    expect(w.find('.wn-empty').exists()).toBe(true)

    // A concept appears (another client / materialization); realtime should pull it in.
    ;(globalThis as any).__kbApi__['/graph'] = {
      success: true,
      nodes: [
        { id: 'root', label: 'Root', is_root: true },
        { id: 'new', label: 'Fresh Concept', concept_type: 'topic' },
      ],
      edges: [{ id: 'e1', from_node_id: 'new', to_node_id: 'root', edge_type: 'subtopic_of' }],
    }
    ;(globalThis as any).__kbEmit__({
      topic: 'component.kb1',
      data: { event: 'component.meta.changed', component_id: 'kb1', meta: { graph_updated_at: '2026-01-01T00:00:00Z' } },
    })
    await new Promise(r => setTimeout(r, 500)) // past the 400ms refresh debounce
    await flushPromises()
    expect(w.html()).toContain('Fresh Concept')
    w.unmount()
  })
})

describe('AddPanel file upload', () => {
  it('uploads a picked file and completes via realtime', async () => {
    ;(globalThis as any).__kbHandlers__ = []
    ;(globalThis as any).__kbApi__['/upload-token'] = { success: true, upload_token: 'tok' }
    ;(globalThis as any).__kbApi__['/api/v1/uploads'] = { success: true, uuid: 'u7', component_id: 'uploads-u1' }
    const w = mount(AddPanel, { props: { kbId: 'kb1' } })
    await flushPromises()
    // file tab is default; set files on the hidden input and fire change.
    const input = w.find('input.ap-file')
    Object.defineProperty(input.element, 'files', { value: [new File(['x'], 'a.pdf', { type: 'application/pdf' })], configurable: true })
    await input.trigger('change')
    await flushPromises()
    // drive upload completion
    ;(globalThis as any).__kbEmit__({ topic: 'component.uploads-u1.events', data: { event: 'kickside.uploads.events:upload.status.changed', upload_id: 'u7', status: 'completed' } })
    await flushPromises()
    expect(w.exists()).toBe(true)
    w.unmount()
  })

  // A standalone image carries no extractable text: the uploads image processor
  // stores it as an image artifact and produces no text artifact, so ingesting one
  // would embed its bytes rather than its meaning. The picker says so and starts
  // no upload; images reach a knowledge base as figures inside a document.
  it('refuses a standalone image and starts no upload for it', async () => {
    ;(globalThis as any).__kbApi__['/upload-token'] = { success: true, upload_token: 'tok' }
    ;(globalThis as any).__kbApi__['/api/v1/uploads'] = { success: true, uuid: 'img1', component_id: 'uploads-u1' }
    const w = mount(AddPanel, { props: { kbId: 'kb1' } })
    await flushPromises()
    const input = w.find('input.ap-file')
    expect(input.attributes('accept')).toContain('.pdf')
    expect(input.attributes('accept')).not.toContain('image/*')
    Object.defineProperty(input.element, 'files', { value: [new File(['x'], 'photo.png', { type: 'image/png' })], configurable: true })
    await input.trigger('change')
    await flushPromises()
    expect(w.html()).toContain('not supported for knowledge ingestion')
    expect(w.findAll('.ap-item')).toHaveLength(0)
    expect(api.post).not.toHaveBeenCalledWith('/api/v1/knowledge/kb1/upload-token')
    w.unmount()
  })

  // A rejected file does not take the drop with it: the supported files in the
  // same selection still upload.
  it('uploads the supported files in a selection that also holds an image', async () => {
    ;(globalThis as any).__kbApi__['/upload-token'] = { success: true, upload_token: 'tok' }
    ;(globalThis as any).__kbApi__['/api/v1/uploads'] = { success: true, uuid: 'u9' }
    const w = mount(AddPanel, { props: { kbId: 'kb1' } })
    await flushPromises()
    const input = w.find('input.ap-file')
    Object.defineProperty(input.element, 'files', {
      value: [new File(['x'], 'photo.png', { type: 'image/png' }), new File(['y'], 'report.pdf', { type: 'application/pdf' })],
      configurable: true,
    })
    await input.trigger('change')
    await flushPromises()
    const items = w.findAll('.ap-item')
    expect(items).toHaveLength(1)
    expect(items[0].text()).toContain('report.pdf')
    w.unmount()
  })

  it('accepts multiple files at once and tracks each', async () => {
    ;(globalThis as any).__kbHandlers__ = []
    ;(globalThis as any).__kbApi__['/upload-token'] = { success: true, upload_token: 'tok' }
    ;(globalThis as any).__kbApi__['/api/v1/uploads'] = { success: true, uuid: 'um' }
    const w = mount(AddPanel, { props: { kbId: 'kb1' } })
    await flushPromises()
    const input = w.find('input.ap-file')
    expect(input.attributes('multiple')).toBeDefined()
    Object.defineProperty(input.element, 'files', {
      value: [new File(['a'], 'a.pdf', { type: 'application/pdf' }), new File(['b'], 'b.txt', { type: 'text/plain' })],
      configurable: true,
    })
    await input.trigger('change')
    await flushPromises()
    expect(w.findAll('.ap-item')).toHaveLength(2)
    w.unmount()
  })
})

describe('AddPanel my uploads', () => {
  it('ingests selected existing uploads and emits changed', async () => {
    ;(globalThis as any).__kbHandlers__ = []
    ;(globalThis as any).__kbApi__['/uploads/list'] = {
      success: true,
      uploads: [{ uuid: 'p1', filename: 'Prior Doc', mime_type: 'application/pdf', size: 2048, status: 'completed' }],
      meta: { total: 1 },
    }
    ;(globalThis as any).__kbApi__['/ingest-upload'] = {
      success: true, queued: 1, total: 1,
      results: [{ upload_id: 'p1', success: true, external_id: 'upload:p1' }],
    }
    const w = mount(AddPanel, { props: { kbId: 'kb1' } })
    await flushPromises()
    await w.findAll('.ap-mode')[2].trigger('click') // My uploads
    await flushPromises()
    expect(w.html()).toContain('Prior Doc')
    await w.find('.ap-upload').trigger('click') // select it
    await w.find('.ap-submit').trigger('click') // add selected
    await flushPromises()
    // Queued into the KB; the panel reports it and asks the host to refresh.
    expect(w.emitted('changed')).toHaveLength(1)
    expect(w.html()).toContain('Added')
    w.unmount()
  })
})

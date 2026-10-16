import { mount } from '@vue/test-utils'
import { h, ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PROPS_PROVIDER } from '@wippy-fe/webcomponent-vue'
import { dependency, initiative, milestone, outcome, roadmap } from './fixtures'

const get = vi.fn()
const post = vi.fn()
const on = vi.fn(() => () => {})

vi.mock('@wippy-fe/proxy', () => ({
  api: { get: (...args: unknown[]) => get(...args), post: (...args: unknown[]) => post(...args) },
  on: (...args: unknown[]) => on(...(args as [])),
}))
vi.mock('@iconify/vue', () => ({ Icon: { name: 'Icon', props: ['icon'], setup: (props: { icon: string }) => () => h('i', { 'data-icon': props.icon }) } }))

const { default: RoadmapApp } = await import('./RoadmapApp.vue')

const STATE = roadmap({
  outcomes: [outcome('o1', 'Make it pay', 0)],
  initiatives: [
    initiative('a', { layer_id: 'platform', title: 'Scheduler', status: 'active', progress: 0.5 }),
    initiative('b', { layer_id: 'kickside', title: 'Workflow builder', start_period: '2026-Q4', outcome_id: 'o1' }),
  ],
  dependencies: [dependency('d1', 'a', 'b')],
  milestones: [milestone('m1', 'KickSide 1.0', '2026-Q4', { initiative_ids: ['b'] })],
  can_undo: true,
})

function mountApp(mode = 'full', readOnly = false) {
  return mount(RoadmapApp, { global: { provide: { [PROPS_PROVIDER as symbol]: ref({ entryId: 'r1', mode, readOnly }) } } })
}

async function settle(wrapper: ReturnType<typeof mountApp>) {
  await Promise.resolve()
  await Promise.resolve()
  await wrapper.vm.$nextTick()
}

describe('RoadmapApp', () => {
  beforeEach(() => {
    get.mockReset()
    post.mockReset()
    on.mockClear()
    get.mockResolvedValue({ data: { success: true, roadmap: STATE } })
    post.mockResolvedValue({ data: { success: true, roadmap: STATE } })
  })

  it('renders the timeline lens with a lane per layer once loaded', async () => {
    const wrapper = mountApp()
    await settle(wrapper)
    expect(wrapper.findAll('.rm-tl-lane').length).toBe(3)
    expect(wrapper.findAll('.rm-bar').length).toBe(2)
    expect(wrapper.find('.rm-today').exists()).toBe(true)
  })

  it('subscribes to the committed projection of its own thread', async () => {
    const wrapper = mountApp()
    await settle(wrapper)
    expect(on).toHaveBeenCalledWith('kickside.thread.thread-1.projection.chestor.roadmap:state', expect.any(Function))
  })

  it('issues no request at all without an entry id', async () => {
    const wrapper = mount(RoadmapApp, { global: { provide: { [PROPS_PROVIDER as symbol]: ref({ entryId: '', mode: 'full' }) } } })
    await settle(wrapper)
    expect(get).not.toHaveBeenCalled()
    expect(wrapper.find('.rm-error').text()).toContain('entry id required')
  })

  it('switches lens as view state of this reader alone', async () => {
    const wrapper = mountApp()
    await settle(wrapper)
    await wrapper.findAll('.rm-lens-btn')[2].trigger('click')
    await settle(wrapper)
    expect(wrapper.find('.rm-strata').exists()).toBe(true)
    expect(post).not.toHaveBeenCalled()
  })

  it('opens on the default lens the roadmap states', async () => {
    get.mockResolvedValue({ data: { success: true, roadmap: { ...STATE, settings: { ...STATE.settings, default_lens: 'outcomes' } } } })
    const wrapper = mountApp()
    await settle(wrapper)
    expect(wrapper.find('.rm-oc').exists()).toBe(true)
  })

  it('sets the default lens once on demand, and offers it only while it differs', async () => {
    const wrapper = mountApp()
    await settle(wrapper)
    await wrapper.find('.rm-more-btn').trigger('click')
    await settle(wrapper)
    expect((wrapper.findAll('.rm-ctx-item')[0].element as HTMLButtonElement).disabled).toBe(true)
    await wrapper.find('.rm-ctx-overlay').trigger('click')

    await wrapper.findAll('.rm-lens-btn')[2].trigger('click')
    await wrapper.find('.rm-more-btn').trigger('click')
    await settle(wrapper)
    await wrapper.findAll('.rm-ctx-item')[0].trigger('click')
    await settle(wrapper)
    expect(post.mock.calls.length).toBe(1)
    expect(post).toHaveBeenCalledWith('/api/v1/workspace/roadmaps/r1/apply', {
      commands: [{ type: 'chestor.roadmap.events:roadmap.settings-updated', body: { settings: { default_lens: 'strata' } } }],
    })
  })

  it('selecting a bar opens the inspector on that initiative', async () => {
    const wrapper = mountApp()
    await settle(wrapper)
    await wrapper.findAll('.rm-bar')[0].trigger('click')
    await settle(wrapper)
    expect(wrapper.find('.rm-panel-head h3').text()).toBe('Initiative')
    expect((wrapper.find('.rm-panel input.rm-input').element as HTMLInputElement).value).toBe('Scheduler')
  })

  it('removes an initiative only after unlinking every reference, in one batch', async () => {
    const wrapper = mountApp()
    await settle(wrapper)
    await wrapper.findAll('.rm-bar')[1].trigger('click')
    await settle(wrapper)
    await wrapper.find('.rm-btn--danger').trigger('click')
    await settle(wrapper)
    const body = post.mock.calls.at(-1)?.[1] as { commands: Array<{ type: string; body: Record<string, unknown> }> }
    expect(body.commands.map(c => c.type)).toEqual([
      'chestor.roadmap.events:dependency.removed',
      'chestor.roadmap.events:milestone.updated',
      'chestor.roadmap.events:initiative.removed',
    ])
    expect(body.commands[1].body.initiative_ids).toEqual([])
  })

  it('preview mode is read-only: no toolbar, no inspector, no mutation', async () => {
    const wrapper = mountApp('preview')
    await settle(wrapper)
    expect(wrapper.find('.rm-lenses').exists()).toBe(false)
    expect(wrapper.find('.rm-panel').exists()).toBe(false)
    expect(wrapper.find('.rm-foot').exists()).toBe(true)
    await wrapper.findAll('.rm-bar')[0].trigger('click')
    await wrapper.trigger('keydown', { key: 'z', ctrlKey: true })
    await settle(wrapper)
    expect(post).not.toHaveBeenCalled()
  })

  it('undo posts to the history endpoint when the stack allows it', async () => {
    const wrapper = mountApp()
    await settle(wrapper)
    await wrapper.trigger('keydown', { key: 'z', ctrlKey: true })
    await settle(wrapper)
    expect(post).toHaveBeenCalledWith('/api/v1/workspace/roadmaps/r1/undo', {})
  })

  it('offers the starter layers instead of seeding them when a roadmap is empty', async () => {
    get.mockResolvedValue({ data: { success: true, roadmap: roadmap({ layers: [] }) } })
    const wrapper = mountApp()
    await settle(wrapper)
    expect(wrapper.find('.rm-empty').exists()).toBe(true)
    expect(post).not.toHaveBeenCalled()
    await wrapper.findAll('.rm-empty-actions .rm-btn')[1].trigger('click')
    await settle(wrapper)
    const body = post.mock.calls.at(-1)?.[1] as { commands: Array<{ type: string }> }
    expect(body.commands.length).toBe(5)
    expect(body.commands.every(c => c.type === 'chestor.roadmap.events:layer.added')).toBe(true)
  })

  it('keeps a lens toggle local until the reader asks for it to be remembered', async () => {
    const wrapper = mountApp()
    await settle(wrapper)
    await wrapper.findAll('.rm-chip-btn')[0].trigger('click')
    await settle(wrapper)
    expect(wrapper.findAll('.rm-chip-btn')[0].classes()).toContain('is-on')
    expect(post).not.toHaveBeenCalled()

    await wrapper.find('.rm-more-btn').trigger('click')
    await settle(wrapper)
    await wrapper.findAll('.rm-ctx-item')[1].trigger('click')
    await settle(wrapper)
    expect(post.mock.calls.length).toBe(1)
    expect(post).toHaveBeenCalledWith('/api/v1/workspace/roadmaps/r1/apply', {
      commands: [{ type: 'chestor.roadmap.events:roadmap.lens-state-set', body: { lens: 'timeline', state: { dropped: true } } }],
    })
  })

  it('surfaces the server sentence and lets the reader dismiss it', async () => {
    get.mockResolvedValue({ data: { success: false, error: 'roadmap not found' } })
    const wrapper = mountApp()
    await settle(wrapper)
    expect(wrapper.find('.rm-error').text()).toContain('roadmap not found')
    await wrapper.find('.rm-error .rm-icon-btn').trigger('click')
    expect(wrapper.find('.rm-error').exists()).toBe(false)
  })
})

describe('shared roadmap reading', () => {
  it('keeps all lenses available while removing write controls for a reader', async () => {
    get.mockResolvedValue({ data: { success: true, roadmap: STATE } })
    const wrapper = mountApp('full', true)
    await settle(wrapper)
    expect(wrapper.text()).toContain('Horizons')
    expect(wrapper.find('button[aria-label="Add"]').exists()).toBe(false)
    expect(wrapper.find('button[aria-label="Undo"]').exists()).toBe(false)
    wrapper.unmount()
  })
})

describe('shared roadmap keyboard navigation', () => {
  it('switches lenses for a reader without applying changes', async () => {
    get.mockResolvedValue({ data: { success: true, roadmap: STATE } })
    post.mockClear()
    const view = mountApp('full', true)
    await settle(view)
    await view.get('.rm').trigger('keydown', { key: '2' })
    expect(view.get('.rm-lens-btn.is-active').text()).toContain('Horizons')
    expect(post).not.toHaveBeenCalled()
    view.unmount()
  })
})

describe('roadmap menu focus', () => {
  it('returns focus to the reading surface after a menu action', async () => {
    get.mockResolvedValue({ data: { success: true, roadmap: STATE } })
    post.mockResolvedValue({ data: { success: true, roadmap: STATE } })
    const view = mount(RoadmapApp, { attachTo: document.body, global: { provide: { [PROPS_PROVIDER as symbol]: ref({ entryId: 'r1', mode: 'full' }) } } })
    await settle(view)
    await view.get('button[aria-label="Add"]').trigger('click')
    const item = view.findAll('.rm-ctx-item').find(button => button.text() === 'Initiative')!
    ;(item.element as HTMLElement).focus()
    await item.trigger('click')
    await settle(view)
    expect(document.activeElement).toBe(view.get('.rm').element)
    view.unmount()
  })
})

it('reports unavailable roadmap live updates while retaining the roadmap', async () => {
  get.mockResolvedValue({ data: { success: true, roadmap: STATE } })
  on.mockImplementationOnce(() => { throw new Error('Subscription unavailable') })
  const view = mountApp()
  await settle(view)
  expect(view.text()).toContain('Live updates are unavailable.')
  expect(view.find('.rm-bar').exists()).toBe(true)
  view.unmount()
})

it('reports roadmap live-update cleanup failures', async () => {
  const captured = vi.fn()
  get.mockResolvedValue({ data: { success: true, roadmap: STATE } })
  on.mockReturnValueOnce(() => { throw new Error('Dispose failed') })
  const view = mount(RoadmapApp, { global: { config: { errorHandler: captured }, provide: { [PROPS_PROVIDER as symbol]: ref({ entryId: 'r1', mode: 'full' }) } } })
  await settle(view)
  view.unmount()
  expect(captured).toHaveBeenCalledWith(expect.objectContaining({ message: 'Couldn’t close live updates.' }), expect.anything(), 'beforeUnmount hook')
})

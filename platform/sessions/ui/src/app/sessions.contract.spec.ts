import { beforeEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { ref } from 'vue'
import Sessions from './sessions.vue'
import SessionRow from './SessionRow.vue'

const session = {
  session_id: 'session-1',
  title: 'Planning chat',
  current_agent: 'assistant',
  current_model: 'model',
  last_message_date: '2026-08-04T10:00:00Z',
  public_meta: { favorite: true },
}

beforeEach(() => {
  ;(globalThis as any).__events__ = []
  ;(globalThis as any).__hostVisible__ = undefined
  ;(globalThis as any).__api__ = {
    '/sessions?': { success: true, count: 1, sessions: [session] },
    '/user-agents': { success: true, agents: [] },
    '/connections/providers/badges': { success: true, providers: [] },
  }
  ;(globalThis as any).__getCallBaseline__ = undefined
})

describe('sessions chat contracts', () => {
  it.each([{}, { mode: 'manager' }])('offers New chat in manager mode %j', async (props) => {
    ;(globalThis as any).__props__ = props
    const wrapper = mount(Sessions)
    await flushPromises()

    const button = wrapper.findAll('button').find(button => button.text() === 'New chat')
    expect(button).toBeDefined()
    await button!.trigger('click')
    expect((globalThis as any).__events__).toEqual([{ name: 'new-chat', detail: undefined }])
    wrapper.unmount()
  })

  it('reloads retained session data only for a false-to-true visibility transition', async () => {
    ;(globalThis as any).__props__ = {}
    const visible = ref(false)
    ;(globalThis as any).__hostVisible__ = visible
    const wrapper = mount(Sessions)
    await flushPromises()
    const root = wrapper.element
    const get = (await import('@wippy-fe/proxy')).api.get as any
    expect(get).toHaveBeenCalledTimes(3)

    visible.value = true
    await flushPromises()
    expect(get).toHaveBeenCalledTimes(6)
    expect(wrapper.element).toBe(root)

    visible.value = true
    await flushPromises()
    expect(get).toHaveBeenCalledTimes(6)
    wrapper.unmount()
  })

  it('keeps manager mode as the default and opens the selected session through app events', async () => {
    ;(globalThis as any).__props__ = {}
    const wrapper = mount(Sessions)
    await flushPromises()

    expect(wrapper.find('.kx-head').exists()).toBe(true)
    await wrapper.find('.kx-row-main').trigger('click')

    expect((globalThis as any).__events__).toEqual([
      { name: 'session-select', detail: { sessionId: 'session-1' } },
      { name: 'kickside-chat-open', detail: { kind: 'session', sessionId: 'session-1' } },
    ])
    wrapper.unmount()
  })

  it('renders a compact sidebar with active selection and New chat event', async () => {
    ;(globalThis as any).__props__ = { mode: 'sidebar', activeSessionId: 'session-1' }
    const wrapper = mount(Sessions)
    await flushPromises()

    expect(wrapper.find('.kx-side-head').exists()).toBe(true)
    expect(wrapper.find('.kx-row-main').attributes('aria-current')).toBe('page')
    await wrapper.find('.kx-side-new').trigger('click')
    expect((globalThis as any).__events__).toContainEqual({ name: 'new-chat', detail: undefined })
    wrapper.unmount()
  })

  it('renders a source marker from the canonical provider catalogue with safe fallbacks', () => {
    const sourceLabel = (row: Record<string, unknown>, providers?: Record<string, { icon: string, label: string }>) => {
      const wrapper = mount(SessionRow, { props: { session: row as any, agent: 'A', favorite: false, providers } })
      const label = wrapper.get('.kx-src').attributes('aria-label')
      wrapper.unmount()
      return label
    }
    const providers = { discord: { icon: 'tabler:brand-discord', label: 'Discord' } }
    expect(sourceLabel({ ...session, meta: { provider: 'Discord' } }, providers)).toBe('Discord')
    expect(sourceLabel({ ...session, meta: { provider: 'unavailable' } }, providers)).toBe('unavailable')
    expect(sourceLabel({ ...session, meta: { provider: 'constructor' } }, providers)).toBe('constructor')
    expect(sourceLabel({ ...session, kind: 'DM' }, providers)).toBe('Direct message')
    expect(sourceLabel({ ...session, meta: null }, providers)).toBe('Chat')
  })

  it('renders newly declared provider badges and ignores inherited catalog entries', () => {
    const providers = Object.assign(Object.create({ inherited: { icon: 'tabler:lock', label: 'Inherited' } }), {
      fixture_provider: { icon: 'tabler:flask', label: 'Fixture channel' },
    })
    const declared = mount(SessionRow, {
      props: { session: { ...session, meta: { provider: ' Fixture_Provider ' } } as any, agent: 'A', favorite: false, providers },
    })
    expect(declared.get('.kx-src').attributes('aria-label')).toBe('Fixture channel')
    expect(declared.get('.kx-src [icon]').attributes('icon')).toBe('tabler:flask')
    declared.unmount()
    const inherited = mount(SessionRow, {
      props: { session: { ...session, meta: { provider: 'inherited' } } as any, agent: 'A', favorite: false, providers },
    })
    expect(inherited.get('.kx-src').attributes('aria-label')).toBe('inherited')
    expect(inherited.get('.kx-src [icon]').attributes('icon')).toBe('tabler:plug-connected')
    inherited.unmount()
  })

  it('uses a compact labeled actions menu alongside the source marker', async () => {
    const wrapper = mount(SessionRow, {
      props: { session: session as any, agent: 'A', favorite: false },
    })

    expect(wrapper.get('.kx-src').attributes('aria-label')).toBe('Chat')
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)

    await wrapper.get('[aria-label="Session actions"]').trigger('click')

    expect(wrapper.get('[role="menu"]').text()).toContain('Restart as new chat')
    expect(wrapper.get('[role="menu"]').text()).toContain('Preview messages')
    expect(wrapper.get('[role="menu"]').text()).toContain('Rename')
    expect(wrapper.get('[role="menu"]').text()).toContain('Delete')

    await wrapper.get('[role="menuitem"]:nth-child(2)').trigger('click')
    expect(wrapper.emitted('preview')).toHaveLength(1)
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
    wrapper.unmount()
  })
})

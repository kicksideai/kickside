// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const loadByTagName = vi.hoisted(() => vi.fn())
const api = vi.hoisted(() => ({
  get: vi.fn(async () => ({ data: { success: true, layout: 'vertical' } })),
  post: vi.fn(async () => ({ data: { success: true } })),
  put: vi.fn(async (): Promise<{ data: { success: boolean; error?: string } }> => ({ data: { success: true } })),
}))

vi.mock('@wippy-fe/proxy', () => ({ on: vi.fn(() => vi.fn()) }))

vi.mock('../composables/useWippy', () => ({
  useWippy: () => ({ loadByTagName, ws: {}, on: vi.fn() }),
  useApi: () => api,
}))

import SplashHost from './SplashHost.vue'
import { useSurfaces } from '../composables/useSurfaces'

const splash = {
  id: 'welcome',
  title: 'KickSide',
  steps: [
    { id: 'workspace', title: 'Name your workspace', field: 'workspace_name' },
    {
      id: 'models',
      title: 'Connect your AI model',
      component_tag: 'kickside-onboard-models',
    },
  ],
}

describe('SplashHost component steps', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    loadByTagName.mockResolvedValue(undefined)
  })

  it('mounts a component into the new keyed step host after navigation', async () => {
    const wrapper = mount(SplashHost, { props: { splash } })

    await wrapper.get('#sp-ws-name').setValue('Engineering')
    await wrapper.get('.sp-row .sp-p').trigger('click')
    await vi.waitFor(() => {
      expect(loadByTagName).toHaveBeenCalledWith('kickside-onboard-models')
      expect(wrapper.find('.sp-step-host kickside-onboard-models').exists()).toBe(true)
    })

    expect(wrapper.get('kickside-onboard-models').attributes('step-id')).toBe('models')
  })

  it('mounts the next keyed host when one component finishes synchronously', async () => {
    const wrapper = mount(SplashHost, {
      props: {
        splash: {
          ...splash,
          steps: [
            ...splash.steps,
            {
              id: 'modules',
              title: 'Pick your instruments',
              component_tag: 'kickside-onboard-modules',
            },
          ],
        },
      },
    })

    await wrapper.get('#sp-ws-name').setValue('Engineering')
    await wrapper.get('.sp-row .sp-p').trigger('click')
    await vi.waitFor(() => expect(wrapper.find('kickside-onboard-models').exists()).toBe(true))

    wrapper.get('kickside-onboard-models').element.dispatchEvent(new CustomEvent('done', {
      bubbles: true,
      composed: true,
      detail: { status: 'skipped', model_configured: false },
    }))

    await vi.waitFor(() => {
      expect(loadByTagName).toHaveBeenCalledWith('kickside-onboard-modules')
      expect(wrapper.find('.sp-step-host kickside-onboard-modules').exists()).toBe(true)
    })
  })

  it('shows a recoverable error instead of a blank mandatory step', async () => {
    loadByTagName.mockRejectedValueOnce(new Error('bundle unavailable'))
    const wrapper = mount(SplashHost, { props: { splash } })

    await wrapper.get('#sp-ws-name').setValue('Engineering')
    await wrapper.get('.sp-row .sp-p').trigger('click')
    await vi.waitFor(() => expect(wrapper.find('[role="alert"]').exists()).toBe(true))
    expect(wrapper.text()).toContain('Setup choices could not be loaded')
    expect(wrapper.findAll('.sp-component-actions button').map(button => button.text())).toEqual(['‹ Back', 'Retry'])

    await wrapper.findAll('.sp-component-actions button')[1].trigger('click')
    await vi.waitFor(() => expect(wrapper.find('kickside-onboard-models').exists()).toBe(true))
  })

  it('does not advance or claim completion when a required setting fails to save', async () => {
    api.put.mockResolvedValueOnce({ data: { success: false, error: 'write denied' } })
    const wrapper = mount(SplashHost, { props: { splash } })

    await wrapper.get('#sp-ws-name').setValue('Engineering')
    await wrapper.get('.sp-row .sp-p').trigger('click')

    expect(wrapper.find('kickside-onboard-models').exists()).toBe(false)
    expect(wrapper.text()).toContain('write denied')
  })

  it('shows a seen-save error and lets the user retry entering the workspace', async () => {
    const wrapper = mount(SplashHost, {
      props: {
        splash: {
          id: 'welcome',
          title: 'KickSide',
          steps: [{ id: 'done', title: 'Ready', field: 'done' }],
        },
        dismissError: 'Could not persist setup completion.',
        dismissing: false,
      },
    })

    expect(wrapper.get('[role="alert"]').text()).toBe('Could not persist setup completion.')
    expect(wrapper.get('.sp-row .sp-p').text()).toBe('Enter workspace')
    expect(wrapper.get('.sp-row .sp-p').attributes('disabled')).toBeUndefined()

    await wrapper.setProps({ dismissError: '', dismissing: true })
    expect(wrapper.get('.sp-row .sp-p').text()).toBe('Saving…')
    expect(wrapper.get('.sp-row .sp-p').attributes('disabled')).toBeDefined()

    await wrapper.setProps({ dismissing: false })
    await wrapper.get('.sp-row .sp-p').trigger('click')
    expect(wrapper.emitted('done')).toHaveLength(1)
  })

  it('records an explicit optional skip separately from completed setup', async () => {
    const wrapper = mount(SplashHost, {
      props: {
        splash: {
          id: 'welcome',
          title: 'KickSide',
          steps: [
            { id: 'logo', title: 'Add your logo', field: 'logo', optional: true },
            { id: 'done', title: 'Ready', field: 'done' },
          ],
        },
      },
    })

    await wrapper.get('.sp-row .sp-g').trigger('click')

    expect(wrapper.text()).toContain('Add your logo')
    expect(wrapper.text()).toContain('Skipped')
    expect(wrapper.get('.sp-done-item').classes()).toContain('is-skipped')
  })
})


describe('SplashHost navigation', () => {
  it('forwards a canonical navigate event from a component step', async () => {
    const wrapper = mount(SplashHost, { props: { splash: { id: 'personal-setup', steps: [{id:'create', component_tag:'test-personal-setup'}] } } })
    await vi.waitFor(() => expect(wrapper.find('test-personal-setup').exists()).toBe(true))
    wrapper.get('test-personal-setup').element.dispatchEvent(new CustomEvent('navigate', {
      detail: {path:'/sessions',startToken:'agent-token'}, bubbles:true, composed:true,
    }))
    expect(wrapper.emitted('navigate')).toEqual([[{path:'/sessions',startToken:'agent-token'}]])
    wrapper.unmount()
  })
})


describe('Splash presentation', () => {
  const dialogSplash = {
    id: 'first_agent', presentation: 'dialog' as const,
    steps: [{ id: 'create', title: 'Create your first agent', component_tag: 'kickside-agent-onboarding' }],
  }

  it.each([undefined, 'fullscreen' as const])('keeps %s full-screen with its rail and no dismissal control', async (presentation) => {
    const wrapper = mount(SplashHost, { props: { splash: { ...splash, presentation } } })
    expect(wrapper.find('.sp-screen').exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'SplashWizardRail' }).exists()).toBe(true)
    expect(wrapper.find('[aria-label="Close onboarding"]').exists()).toBe(false)
    await wrapper.trigger('cancel')
    expect(wrapper.emitted('dismiss')).toBeUndefined()
    wrapper.unmount()
  })

  it('renders a labelled native modal without a rail or step counter', async () => {
    const wrapper = mount(SplashHost, { attachTo: document.body, props: { splash: dialogSplash } })
    await vi.waitFor(() => expect(wrapper.find('kickside-agent-onboarding').exists()).toBe(true))
    const dialog = wrapper.get('dialog')
    expect(dialog.attributes('open')).toBeDefined()
    expect(dialog.attributes('aria-modal')).toBe('true')
    expect(wrapper.get('#' + dialog.attributes('aria-labelledby')).text()).toBe('Create your first agent')
    expect(wrapper.findComponent({ name: 'SplashWizardRail' }).exists()).toBe(false)
    expect(wrapper.find('.sp-screen').exists()).toBe(false)
    expect(wrapper.find('.sp-eyebrow').exists()).toBe(false)
    wrapper.unmount()
  })

  it.each(['close', 'escape'])('%s persists scoped dismissal before removing the dialog', async (action) => {
    const surfaces = useSurfaces()
    surfaces.splash.value = dialogSplash
    api.post.mockResolvedValueOnce({ data: { success: true } })
    const wrapper = mount(SplashHost, {
      attachTo: document.body,
      props: { splash: dialogSplash, onDismiss: surfaces.dismissSplash },
    })
    if (action === 'close') await wrapper.get('[aria-label="Close onboarding"]').trigger('click')
    else {
      const cancel = new Event('cancel', { cancelable: true })
      wrapper.get('dialog').element.dispatchEvent(cancel)
      expect(cancel.defaultPrevented).toBe(true)
    }
    await vi.waitFor(() => expect(surfaces.splash.value).toBeNull())
    expect(api.post).toHaveBeenCalledWith('/api/v1/ui/splash/first_agent/seen')
    wrapper.unmount()
  })

  it('lets an expanded picker consume Escape before native dialog cancellation', async () => {
    const wrapper = mount(SplashHost, { attachTo: document.body, props: { splash: dialogSplash } })
    await vi.waitFor(() => expect(wrapper.find('kickside-agent-onboarding').exists()).toBe(true))
    const root = wrapper.get('kickside-agent-onboarding').element.attachShadow({ mode: 'open' })
    const picker = document.createElement('button')
    picker.setAttribute('role', 'combobox')
    picker.setAttribute('aria-expanded', 'true')
    root.append(picker)
    const expandedEscape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true, cancelable: true })
    picker.dispatchEvent(expandedEscape)
    expect(expandedEscape.defaultPrevented).toBe(true)
    expect(wrapper.emitted('dismiss')).toBeUndefined()
    picker.setAttribute('aria-expanded', 'false')
    const closedEscape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true, cancelable: true })
    picker.dispatchEvent(closedEscape)
    expect(closedEscape.defaultPrevented).toBe(false)
    wrapper.unmount()
  })

  it('wraps Tab and Shift+Tab across nested shadow-root controls', async () => {
    const wrapper = mount(SplashHost, { attachTo: document.body, props: { splash: dialogSplash } })
    await vi.waitFor(() => expect(wrapper.find('kickside-agent-onboarding').exists()).toBe(true))
    const root = wrapper.get('kickside-agent-onboarding').element.attachShadow({ mode: 'open' })
    const last = document.createElement('button')
    const disabled = document.createElement('button')
    disabled.disabled = true
    root.append(last, disabled)
    const first = wrapper.get('[aria-label="Close onboarding"]').element as HTMLButtonElement
    first.focus()
    first.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, composed: true, cancelable: true }))
    expect(root.activeElement).toBe(last)
    last.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, composed: true, cancelable: true }))
    expect(document.activeElement).toBe(first)
    wrapper.unmount()
  })

  it('keeps failed dismissal visible and blocks duplicate close while saving', async () => {
    const wrapper = mount(SplashHost, {
      props: { splash: dialogSplash, dismissing: true, dismissError: 'Profile write fails' },
    })
    await wrapper.get('[aria-label="Close onboarding"]').trigger('click')
    await wrapper.get('dialog').trigger('cancel')
    expect(wrapper.emitted('dismiss')).toBeUndefined()
    expect(wrapper.get('[role="alert"]').text()).toBe('Profile write fails')
    wrapper.unmount()
  })
})

describe('SplashHost external agent step', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('issues a client config that MCP clients load as a streamable HTTP server', async () => {
    api.get.mockResolvedValue({ data: { success: true, config: { url: 'http://localhost:8085/keeper-mcp/' } } } as never)
    api.post.mockResolvedValue({ data: { success: true, token: { token: 'wkmcp_test' } } } as never)
    const wrapper = mount(SplashHost, {
      props: {
        splash: {
          id: 'welcome',
          title: 'KickSide',
          steps: [{ id: 'agent', title: 'Connect an external agent', field: 'mcp' }],
        },
      },
    })

    await wrapper.get('.sp-field .sp-btn.sp-p').trigger('click')
    await vi.waitFor(() => expect(wrapper.find('.sp-mcp-cfg').exists()).toBe(true))

    expect(JSON.parse(wrapper.get('.sp-mcp-cfg').text())).toEqual({
      mcpServers: {
        kickside: {
          type: 'http',
          url: 'http://localhost:8085/keeper-mcp/',
          headers: { Authorization: 'Bearer wkmcp_test' },
        },
      },
    })
  })
})

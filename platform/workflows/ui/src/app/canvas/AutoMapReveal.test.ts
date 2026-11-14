// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('@iconify/vue', () => ({ Icon: { props: ['icon'], template: '<i :data-icon="icon" />' } }))
vi.mock('./use-overlay-measure', async () => {
  const { ref } = await import('vue')
  return { useOverlayMeasure: () => ({ overlayEl: ref(null) }) }
})

const AutoMapReveal = (await import('./AutoMapReveal.vue')).default
const entry = {
  id: 'edge-1',
  sourceId: 'start',
  targetId: 'send',
  result: {
    status: 'auto' as const,
    transform: '{ email: output.email }',
    unresolved: [],
    fields: [{
      key: 'email',
      title: 'Email',
      expr: 'output.email',
      sourceName: 'email',
      sourceType: 'string',
      targetType: 'string',
      required: true,
      match: 'exact' as const,
      typed: true,
      why: 'Email matches by name and type.',
    }],
  },
}

describe('AutoMapReveal accessibility contract', () => {
  it('uses a PrimeVue button for the reveal action and exposes its result', async () => {
    const wrapper = mount(AutoMapReveal, { props: { entry } })
    const reveal = wrapper.get('.wf-automap-card')

    expect(reveal.element.tagName).toBe('BUTTON')
    expect(reveal.attributes('role')).toBeUndefined()
    expect(reveal.attributes('aria-label')).toContain('Open mapping')
    expect(reveal.text()).toContain('email')
    expect(reveal.text()).toContain('Email')
    expect(wrapper.html()).toMatchSnapshot('automatic mapping reveal')

    await reveal.trigger('click')
    expect(wrapper.emitted('open')).toEqual([['edge-1']])
  })

  it('keeps the settled trace operable through named PrimeVue buttons', async () => {
    const wrapper = mount(AutoMapReveal, { props: { entry } })

    vi.advanceTimersByTime(2600)
    await wrapper.vm.$nextTick()

    const open = wrapper.get('.wf-automap-tracebtn')
    const dismiss = wrapper.get('.wf-automap-tracex')
    expect(open.element.tagName).toBe('BUTTON')
    expect(open.attributes('aria-label')).toBeTruthy()
    expect(dismiss.attributes('aria-label')).toBe('Dismiss automatic mapping explanation')
    expect(wrapper.html()).toMatchSnapshot('settled automatic mapping trace')

    await open.trigger('click')
    await dismiss.trigger('click')
    expect(wrapper.emitted('open')).toEqual([['edge-1']])
    expect(wrapper.emitted('dismiss')).toEqual([['edge-1']])
  })
})

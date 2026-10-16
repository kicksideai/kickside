// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('@iconify/vue', () => ({ Icon: { props: ['icon'], template: '<i :data-icon="icon" />' } }))

const ValueDisplay = (await import('./ValueDisplay.vue')).default

describe('typed CRM references', () => {
  it('navigates record references with a semantic button', async () => {
    const wrapper = mount(ValueDisplay, {
      props: {
        value: { kind: 'record', type: 'company', id: 'company:acme', label: 'Acme' },
        attribute: { object_type: 'person', attr: 'company', label: 'Company', data_type: 'relation', config: { target: { kind: 'record', object_type: 'company' } } },
      },
    })
    const button = wrapper.get('button')
    expect(button.text()).toContain('Acme')
    await button.trigger('click')
    expect(wrapper.emitted('navigate')?.[0]).toEqual(['company/r~Y29tcGFueTphY21l'])
  })

  it('uses a real anchor only for an explicitly declared external route', () => {
    const wrapper = mount(ValueDisplay, {
      props: {
        value: { kind: 'component', type: 'knowledge_base', id: 'kb:docs', label: 'Docs' },
        attribute: { object_type: 'person', attr: 'knowledge', label: 'Knowledge', data_type: 'relation', config: { target: { kind: 'component', class: 'knowledge_base', route: 'https://example.test/{type}/{id}' } } },
      },
    })
    const anchor = wrapper.get('a')
    expect(anchor.attributes('href')).toBe('https://example.test/knowledge_base/kb%3Adocs')
    expect(anchor.attributes('target')).toBe('_blank')
  })

  it('reads a stored choice as its option rather than as the stored constant', () => {
    const wrapper = mount(ValueDisplay, {
      props: { value: 'DIRECT_TRAFFIC', attribute: { object_type: 'person', attr: 'source', label: 'Source', data_type: 'select' } },
    })
    expect(wrapper.get('.crm-chip').text()).toBe('Direct Traffic')
  })

  it('shows an unanswered yes/no as an empty field, not as a no', () => {
    const attribute = { object_type: 'person', attr: 'nda', label: 'NDA requested', data_type: 'boolean' }
    const blank = mount(ValueDisplay, { props: { attribute } })
    expect(blank.find('.crm-boolean').exists()).toBe(false)
    expect(blank.text()).toBe('—')
    const answered = mount(ValueDisplay, { props: { value: false, attribute } })
    expect(answered.get('.crm-boolean').text()).toBe('No')
  })

  it('does not reinterpret an untyped scalar as a relation', () => {
    const wrapper = mount(ValueDisplay, {
      props: {
        value: 'company:acme',
        attribute: { object_type: 'person', attr: 'company', label: 'Company', data_type: 'relation', config: { target: { kind: 'record', object_type: 'company' } } },
      },
    })
    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.find('a').exists()).toBe(false)
  })
})

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Spinner from './Spinner.vue'

describe('Spinner', () => {
  it('renders a labelled PrimeVue progress indicator', () => {
    const wrapper = mount(Spinner, { props: { label: 'Loading models…' } })

    const progress = wrapper.get('[role="progressbar"]')
    expect(progress.attributes('aria-label')).toBe('Loading models…')
    expect(progress.attributes('style')).toContain('width: 2rem')
    expect(progress.attributes('style')).toContain('height: 2rem')
    expect(progress.attributes('style')).toContain('margin: 0')
    expect(wrapper.text()).toBe('Loading models…')
  })

  it('provides a default accessible name without visible label text', () => {
    const wrapper = mount(Spinner)

    expect(wrapper.get('[role="progressbar"]').attributes('aria-label')).toBe('Loading')
    expect(wrapper.text()).toBe('')
  })
})

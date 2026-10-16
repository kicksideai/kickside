import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises, enableAutoUnmount } from '@vue/test-utils'
import type { Component } from 'vue'
import KbSearch from './KbSearch.vue'
import { canGenerateAnswer } from '../queryMode'

const { get, post } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }))
vi.mock('@wippy-fe/proxy', () => ({ api: { get, post }, host: { handleError: vi.fn() } }))
vi.mock('@iconify/vue', () => ({ Icon: { render: () => null } }))

const bundles = import.meta.glob('../../../../static/package-*.js', { eager: true })
const packed = Object.values(bundles).flatMap((module) => Object.values(module as object))
  .find((value) => value?.__name === 'KbSearch') as Component

enableAutoUnmount(afterEach)

describe.each([['source', KbSearch], ['served bundle', packed]] as const)('%s Ask capability', (_, component) => {
  beforeEach(() => {
    vi.clearAllMocks()
    get.mockResolvedValue({ data: { success: true, results: [{ id: 'passage', content: 'Search passage' }] } })
    post.mockResolvedValue({ data: { success: true, answer: 'Grounded answer', results: [{ id: 'passage', content: 'Answer source' }] } })
  })

  it.each([{}, { analysis_model: false }, { analysis_model: ' ' }, { summarization_model: 'summary' }])(
    'hides Ask and explains setup without an Answer model: %j', async (config) => {
      const wrapper = mount(component, { props: { kbId: 'kb', ask: canGenerateAnswer(config) } })
      expect(wrapper.find('.kc-search-modes').exists()).toBe(false)
      expect(wrapper.text()).toContain('Select an Answer model in knowledge base settings to enable Ask.')
      await wrapper.get('input').setValue('question')
      await wrapper.get('input').trigger('keyup.enter')
      await flushPromises()
      expect(get).toHaveBeenCalledWith('/api/v1/kb10/kb/search?q=question&limit=20')
      expect(post).not.toHaveBeenCalled()
      expect(wrapper.text()).toContain('Search passage')
    },
  )

  it('uses the answer endpoint and question placeholder with an Answer model', async () => {
    const wrapper = mount(component, { props: { kbId: 'kb', ask: canGenerateAnswer({ analysis_model: 'answer' }) } })
    await wrapper.get('.kc-search-mode:last-child').trigger('click')
    expect(wrapper.get('input').attributes('placeholder')).toBe('Ask this knowledge base a question…')
    await wrapper.get('input').setValue('question')
    await wrapper.get('button[aria-label="Ask"]').trigger('click')
    await flushPromises()
    expect(post).toHaveBeenCalledWith('/api/v1/knowledge/kb/ask', { query: 'question', limit: 8 })
    expect(get).not.toHaveBeenCalled()
    expect(wrapper.get('.kc-ans-body').text()).toBe('Grounded answer')
  })

  it('returns to search when the Answer capability is removed', async () => {
    const wrapper = mount(component, { props: { kbId: 'kb', ask: true } })
    await wrapper.get('.kc-search-mode:last-child').trigger('click')
    await wrapper.setProps({ ask: false })
    expect(wrapper.find('.kc-search-modes').exists()).toBe(false)
    expect(wrapper.get('input').attributes('placeholder')).toBe('Search every indexed passage…')
    await wrapper.get('input').setValue('question')
    await wrapper.get('input').trigger('keyup.enter')
    await flushPromises()
    expect(get).toHaveBeenCalledOnce()
    expect(post).not.toHaveBeenCalled()
  })
})

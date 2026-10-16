import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

const render = vi.fn(async (_id: string, source: string) => ({ svg: `<svg data-source="${source.split('\n')[0]}"></svg>` }))
const initialize = vi.fn()
vi.mock('mermaid', () => ({ default: { initialize, render } }))

const RenderMarkdown = (await import('./RenderMarkdown.vue')).default

describe('<wc-render-markdown> diagrams', () => {
  it('draws a mermaid fence as a diagram', async () => {
    ;(globalThis as unknown as { __props__: object }).__props__ = { source: '# Plan\n\n```mermaid\ngantt\n  title Plan\n```' }
    const wrapper = mount(RenderMarkdown)
    await flushPromises()
    await flushPromises()
    expect(initialize).toHaveBeenCalledWith(expect.objectContaining({ startOnLoad: false, securityLevel: 'strict' }))
    expect(render).toHaveBeenCalledWith(expect.any(String), 'gantt\n  title Plan\n')
    expect(wrapper.find('.md-mermaid svg').attributes('data-source')).toBe('gantt')
    wrapper.unmount()
  })

  it('uses the host text and surface colors for diagrams', async () => {
    initialize.mockClear()
    ;(globalThis as unknown as { __props__: object }).__props__ = { source: '```mermaid\ngraph TD; A-->B\n```' }
    const host = document.createElement('div')
    const styles = document.createElement('style')
    styles.textContent = '.md-mermaid { color: rgb(30, 41, 59); --p-content-background: #f8fafc; --p-content-border-color: #cbd5e1; }'
    host.appendChild(styles)
    document.body.appendChild(host)
    const wrapper = mount(RenderMarkdown, { attachTo: host })
    await flushPromises()
    await flushPromises()
    expect(initialize).toHaveBeenCalledWith(expect.objectContaining({
      theme: 'base', themeVariables: expect.objectContaining({
        primaryColor: '#f8fafc', primaryTextColor: 'rgb(30, 41, 59)', lineColor: 'rgb(30, 41, 59)',
      }),
    }))
    wrapper.unmount()
    host.remove()
  })

  it('shows the diagram source with the reason when a diagram cannot render', async () => {
    render.mockRejectedValueOnce(new Error('Parse error on line 1'))
    ;(globalThis as unknown as { __props__: object }).__props__ = { source: '```mermaid\nnot a diagram\n```' }
    const wrapper = mount(RenderMarkdown)
    await flushPromises()
    await flushPromises()
    expect(wrapper.find('.md-mermaid svg').exists()).toBe(false)
    expect(wrapper.get('.md-mermaid').text()).toContain('not a diagram')
    expect(wrapper.get('.md-mermaid-error').text()).toContain('Parse error on line 1')
    wrapper.unmount()
  })
})

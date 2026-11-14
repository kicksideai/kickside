import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import AgentForm from './AgentForm.vue'

const props = {
  open: true,
  agentId: null,
  traits: [],
  tools: [],
  models: [{ name: 'class:fast' }],
  agents: [],
}

afterEach(() => {
  document.body.innerHTML = ''
  document.body.classList.remove('p-overflow-hidden')
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
})

describe('AgentForm modal contract', () => {
  it('focuses the name, traps page interaction, closes on Escape, and restores the page', async () => {
    const rects = vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue({ length: 1 } as DOMRectList)
    const background = document.createElement('button')
    background.textContent = 'Background'
    document.body.appendChild(background)
    background.focus()

    const wrapper = mount(AgentForm, { props, attachTo: document.body })
    await flushPromises()

    const dialog = document.querySelector<HTMLElement>('[role="dialog"]')
    expect(dialog).not.toBeNull()
    if (!dialog) throw new Error('expected the teleported agent dialog')

    expect(dialog.getAttribute('aria-label')).toBe('New agent')
    expect(document.activeElement).toBe(dialog.querySelector('[data-agent-name]'))
    expect(document.body.classList.contains('p-overflow-hidden')).toBe(true)

    const cancel = Array.from(dialog.querySelectorAll('button')).find((button) => button.textContent === 'Cancel')
    expect(cancel).toBeDefined()
    cancel!.focus()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    expect(dialog.contains(document.activeElement)).toBe(true)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }))
    await flushPromises()
    expect(wrapper.emitted('close')).toHaveLength(1)

    await wrapper.setProps({ open: false })
    await flushPromises()
    await vi.waitFor(() => expect(document.body.classList.contains('p-overflow-hidden')).toBe(false))
    expect(document.activeElement).toBe(background)

    wrapper.unmount()
    rects.mockRestore()
  })

  it.each(['search', 'preview'] as const)('Escape closes the capability %s menu before the dialog', async (target) => {
    const wrapper = mount(AgentForm, { props: { ...props,
      traits: [{ id: 'test:search', title: 'Search', description: 'Search documents.' }],
    }, attachTo: document.body })
    await flushPromises()
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!
    const tab = Array.from(dialog.querySelectorAll<HTMLElement>('[role="tab"]'))
      .find(element => element.textContent?.includes('Capabilities'))!
    tab.click()
    await flushPromises()
    const input = dialog.querySelector<HTMLInputElement>('[aria-label="Search capabilities to add"]')!
    input.focus()
    await flushPromises()
    expect(input.getAttribute('aria-expanded')).toBe('true')
    const owner = target === 'search' ? input : dialog.querySelector<HTMLButtonElement>('[role="option"] .kx-trait-fold')!
    owner.focus()
    const escape = new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true, cancelable: true })
    owner.dispatchEvent(escape)
    await flushPromises()
    expect(input.getAttribute('aria-expanded')).toBe('false')
    expect(escape.defaultPrevented).toBe(true)
    expect(wrapper.emitted('close')).toBeUndefined()
    expect(dialog.isConnected).toBe(true)

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }))
    await flushPromises()
    expect(wrapper.emitted('close')).toHaveLength(1)
    wrapper.unmount()
  })

  it('uses a bounded two-row compact layout and wraps every section into view', () => {
    const css = readFileSync(join(process.cwd(), 'src/styles.css'), 'utf8')
    const compact = css.slice(css.indexOf('@media (max-width: 760px)'))

    expect(compact).toContain('height: min(680px, calc(100dvh - 24px))')
    expect(compact).toContain('grid-template-rows: auto minmax(0, 1fr)')
    expect(css).toMatch(/\.kx-2p\s*\{[^}]*min-width:\s*0/)
    expect(css).toMatch(/\.kx-2p-l\s*\{[^}]*min-width:\s*0/)
    expect(compact).toMatch(/\.kx-2p-l\s*\{[^}]*max-height:\s*none/)
    expect(compact).toMatch(/\.kx-nav\s*\{[^}]*flex-direction:\s*row/)
    expect(compact).toMatch(/\.kx-nav\s*\{[^}]*flex-wrap:\s*wrap/)
    expect(compact).toMatch(/\.kx-nav\s*\{[^}]*max-width:\s*100%/)
  })
})

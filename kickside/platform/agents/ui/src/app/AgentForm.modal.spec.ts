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

  it('uses a bounded two-row compact layout and a horizontal section rail', () => {
    const css = readFileSync(join(process.cwd(), 'src/styles.css'), 'utf8')
    const compact = css.slice(css.indexOf('@media (max-width: 760px)'))

    expect(compact).toContain('height: min(680px, calc(100dvh - 24px))')
    expect(compact).toContain('grid-template-rows: auto minmax(0, 1fr)')
    expect(css).toMatch(/\.kx-2p\s*\{[^}]*min-width:\s*0/)
    expect(css).toMatch(/\.kx-2p-l\s*\{[^}]*min-width:\s*0/)
    expect(compact).toMatch(/\.kx-2p-l\s*\{[^}]*max-height:\s*none/)
    expect(compact).toMatch(/\.kx-nav\s*\{[^}]*flex-direction:\s*row/)
    expect(compact).toMatch(/\.kx-nav\s*\{[^}]*overflow-x:\s*auto/)
  })
})

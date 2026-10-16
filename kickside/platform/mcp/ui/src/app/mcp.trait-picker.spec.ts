import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import type { MintedCredential } from '../types'
vi.mock('@widgets/app/WcMount.vue', () => ({ default: { template: '<div />' } }))
vi.mock('@widgets/app/AnchoredPanel.vue', () => ({ default: { template: '<div><slot /></div>' } }))
import Mcp from './mcp.vue'

describe('MCP agent trait picker integration', () => {
  afterEach(() => {
    ;(globalThis as any).__hostVisibility__.value = false
  })

  it('passes value to the Agents tag and uses its change detail when minting', async () => {
    ;(globalThis as any).__api__ = {
      '/api/v1/mcp/credentials': { success: true, credentials: [] },
      '/api/v1/mcp/components': { success: true, components: [] },
    }
    ;(api.post as any).mockImplementation((url: string, body: unknown) => {
      if (url === '/api/v1/mcp/credentials') {
        return Promise.resolve({ data: {
          success: true,
          credential: {
            credential_id: 'created-1',
            token: 'secret-token',
            token_prefix: 'secret',
            actor_id: 'user-1',
            label: 'Research agent',
            mcp_url: 'https://example.test/api/public/mcp',
          } satisfies MintedCredential,
        } })
      }
      return Promise.resolve({ data: { success: true } })
    })

    const wrapper = mount(Mcp)
    await flushPromises()
    const newCredential = wrapper.findAll('button').find(button => button.text().includes('New credential'))
    expect(newCredential).toBeDefined()
    await newCredential!.trigger('click')
    await flushPromises()

    const picker = document.querySelector('wc-agent-trait-picker') as HTMLElement
    expect(picker).toBeTruthy()
    expect(JSON.parse(picker.getAttribute('value') || '{}')).toEqual({ traits: [], trait_contexts: {} })
    picker.dispatchEvent(new CustomEvent('change', {
      detail: {
        traits: ['kickside.test:search'],
        trait_contexts: { 'kickside.test:search': { limit: 12 } },
      },
      bubbles: true,
      composed: true,
    }))
    await flushPromises()
    expect(JSON.parse(picker.getAttribute('value') || '{}')).toEqual({
      traits: ['kickside.test:search'],
      trait_contexts: { 'kickside.test:search': { limit: 12 } },
    })

    const nestedPicker = document.createElement('span')
    picker.appendChild(nestedPicker)
    nestedPicker.dispatchEvent(new CustomEvent('change', {
      detail: { kb_ids: ['owned-kb'] }, bubbles: true, composed: true,
    }))
    await flushPromises()
    expect(JSON.parse(picker.getAttribute('value') || '{}')).toEqual({
      traits: ['kickside.test:search'],
      trait_contexts: { 'kickside.test:search': { limit: 12 } },
    })

    const label = document.querySelector('input[placeholder="research-agent"]') as HTMLInputElement
    expect(label).toBeTruthy()
    label.value = 'Research agent'
    label.dispatchEvent(new Event('input', { bubbles: true, composed: true }))
    await flushPromises()
    const createButton = Array.from(document.querySelectorAll('button')).find(button => button.textContent?.includes('Create credential'))
    expect(createButton).toBeDefined()
    expect((createButton as HTMLButtonElement).disabled).toBe(false)
    createButton!.click()
    await flushPromises()

    const mint = (api.post as any).mock.calls.find((call: any[]) => call[0] === '/api/v1/mcp/credentials')
    expect(mint?.[1]).toMatchObject({
      label: 'Research agent',
      allowed_trait_ids: ['kickside.test:search'],
      default_active_trait_ids: ['kickside.test:search'],
      agent_profile: { trait_contexts: { 'kickside.test:search': { limit: 12 } } },
    })
    wrapper.unmount()
  })

  it('has no continuation state, control, or credential grant', async () => {
    ;(globalThis as any).__api__ = {
      '/api/v1/mcp/credentials': { success: true, credentials: [] },
      '/api/v1/mcp/components': { success: true, components: [] },
    }
    ;(api.post as any).mockClear()
    ;(api.post as any).mockResolvedValue({ data: { success: true, credential: {
      credential_id: 'credential', token: 'token', token_prefix: 'credential',
    } } })
    const wrapper = mount(Mcp)
    await flushPromises()
    await wrapper.findAll('button').find(button => button.text().includes('New credential'))!.trigger('click')
    await flushPromises()
    const label = document.querySelector('input[placeholder="research-agent"]') as HTMLInputElement
    expect((wrapper.vm as any).form).not.toHaveProperty('continueResults')
    expect(wrapper.text()).not.toContain('Continue large results')
    expect(document.querySelector('input[aria-label="Continue large results"]')).toBeNull()
    label.value = 'Credential'
    label.dispatchEvent(new Event('input', { bubbles: true }))
    await flushPromises()
    Array.from(document.querySelectorAll('button')).find(button => button.textContent?.includes('Create credential'))!.click()
    await flushPromises()
    const mint = (api.post as any).mock.calls.find((call: any[]) => call[0] === '/api/v1/mcp/credentials')
    expect(mint?.[1]).not.toHaveProperty('allowed_tool_ids')
    expect(JSON.stringify(mint?.[1])).not.toContain('ReadToolResult')
    wrapper.unmount()
  })

  it('declares the MCP add-menu behavior on the shared picker tag', async () => {
    ;(globalThis as any).__api__ = {
      '/api/v1/mcp/credentials': { success: true, credentials: [] },
      '/api/v1/mcp/components': { success: true, components: [] },
    }
    const wrapper = mount(Mcp)
    await flushPromises()
    const newCredential = wrapper.findAll('button').find(button => button.text().includes('New credential'))
    expect(newCredential).toBeDefined()
    await newCredential!.trigger('click')
    await flushPromises()

    const picker = document.querySelector('wc-agent-trait-picker') as HTMLElement
    expect(picker).toBeTruthy()
    expect(picker.hasAttribute('keep-menu-open-on-add')).toBe(true)
    expect(picker.getAttribute('refresh-key')).toBe('0')
    wrapper.unmount()
  })
})

/// <reference types="node" />
import { describe, it, expect, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { readFileSync } from 'node:fs'
import CodeBody from './CodeBody.vue'

const stylesText = readFileSync('src/styles.css', 'utf8')

const API = {
  '/api/v1/code-execution/sdk-reference': {
    success: true,
    tools: [
      {
        id: 'kickside.tools:search',
        label: 'Search',
        namespace: 'kickside.tools',
        call: 'sdk.tools["kickside.tools:search"](args)',
        description: 'Search the web',
        input_schema: { type: 'object', properties: { query: { type: 'string' } } },
        output_schema: { type: 'object', properties: { results: { type: 'array' } } },
      },
    ],
  },
}

function emitSpy() { return (globalThis as any).__emit__ }
function lastEmit(name: string) {
  return emitSpy().mock.calls.filter((c: any[]) => c[0] === name).at(-1)
}

beforeEach(() => {
  ;(globalThis as any).__props__ = { config: { code: '' } }
  ;(globalThis as any).__api__ = { ...API }
  ;(globalThis as any).__emit__ = undefined
})

describe('CodeBody', () => {
  it('keeps every intrinsic-width SDK layer inside a constrained inspector', () => {
    expect(stylesText).toMatch(/:host\s*\{[^}]*width:\s*100%[^}]*min-width:\s*0[^}]*max-width:\s*100%[^}]*overflow-x:\s*clip/s)
    expect(stylesText).toMatch(/\.ce-disclosure\s*\{[^}]*min-width:\s*0[^}]*max-width:\s*100%[^}]*overflow:\s*hidden/s)
    expect(stylesText).toMatch(/\.ce-disclosure-body\s*\{[^}]*min-width:\s*0[^}]*max-width:\s*100%/s)
    expect(stylesText).toMatch(/\.ce-sdk-group\s*\{[^}]*min-width:\s*0[^}]*max-width:\s*100%/s)
    expect(stylesText).toMatch(/\.ce-list\s*>\s*li\s*\{[^}]*min-width:\s*0[^}]*max-width:\s*100%/s)
    expect(stylesText).toMatch(/\.ce-sig\s*\{[^}]*min-width:\s*0[^}]*overflow:\s*hidden[^}]*text-overflow:\s*ellipsis/s)
    expect(stylesText).toMatch(/\.ce-code\s*\{[^}]*max-width:\s*100%[^}]*overflow:\s*auto/s)
    expect(stylesText).toMatch(/\.ce-schema\s*\{[^}]*width:\s*100%[^}]*min-width:\s*0[^}]*overflow:\s*auto/s)
  })

  it('renders the code editor, Generate assist, and SDK reference', async () => {
    const w = mount(CodeBody)
    await flushPromises()
    expect(w.find('textarea.ce-code').exists()).toBe(true)
    expect(w.find('textarea.ce-intent').exists()).toBe(true)
    expect(w.find('button.kx-btn-primary').exists()).toBe(true)
    expect(w.find('details.ce-sdk').exists()).toBe(true)
    w.unmount()
  })

  it('seeds the editor from config.code', async () => {
    ;(globalThis as any).__props__ = { config: { code: 'return 42' } }
    const w = mount(CodeBody)
    await flushPromises()
    expect((w.find('textarea.ce-code').element as HTMLTextAreaElement).value).toBe('return 42')
    w.unmount()
  })

  it('emits canonical Block config when the editor changes', async () => {
    const w = mount(CodeBody)
    await flushPromises()
    await w.find('textarea.ce-code').setValue('return 1')
    expect(lastEmit('config-changed')[1]).toEqual({ code: 'return 1' })
    w.unmount()
  })

  it('uses only the code field and preserves an optional method', async () => {
    ;(globalThis as any).__props__ = {
      config: { code: 'return 3', source: 'return 99', tool_ids: [], method: 'main' },
    }
    const w = mount(CodeBody)
    await flushPromises()
    expect((w.find('textarea.ce-code').element as HTMLTextAreaElement).value).toBe('return 3')
    await w.find('textarea.ce-code').setValue('return 4')
    expect(lastEmit('config-changed')[1]).toEqual({ code: 'return 4', method: 'main' })
    w.unmount()
  })

  it('fills the editor and emits when the generator returns validated code', async () => {
    ;(globalThis as any).__api__['/api/v1/code-execution/assist'] = { validated: true, code: 'return sdk.tools["kickside.tools:search"]({ query = "x" })' }
    const w = mount(CodeBody)
    await flushPromises()
    await w.find('textarea.ce-intent').setValue('search the web')
    await w.find('button.kx-btn-primary').trigger('click')
    await flushPromises()
    expect((w.find('textarea.ce-code').element as HTMLTextAreaElement).value).toBe('return sdk.tools["kickside.tools:search"]({ query = "x" })')
    expect(w.text()).toContain('Validated')
    expect(lastEmit('config-changed')[1]).toEqual({ code: 'return sdk.tools["kickside.tools:search"]({ query = "x" })' })
    w.unmount()
  })

  it('surfaces gate errors and leaves the editor unchanged when not validated', async () => {
    ;(globalThis as any).__api__['/api/v1/code-execution/assist'] = { validated: false, errors: ['unknown tool: mailer'] }
    ;(globalThis as any).__props__ = { config: { code: 'return 0' } }
    const w = mount(CodeBody)
    await flushPromises()
    await w.find('textarea.ce-intent').setValue('email the report')
    await w.find('button.kx-btn-primary').trigger('click')
    await flushPromises()
    expect((w.find('textarea.ce-code').element as HTMLTextAreaElement).value).toBe('return 0')
    expect(w.text()).toContain('Not validated')
    expect(w.text()).toContain('unknown tool: mailer')
    w.unmount()
  })

  it('renders the callable tools SDK surface when the reference opens', async () => {
    const w = mount(CodeBody)
    await flushPromises()
    const details = w.find('details.ce-sdk')
    ;(details.element as HTMLDetailsElement).open = true
    await details.trigger('toggle')
    await flushPromises()
    expect(w.find('details.ce-sdk').text()).toContain('sdk.tools["kickside.tools:search"](args)')
    expect(w.find('details.ce-sdk').text()).toContain('Input schema')
    expect(w.find('details.ce-sdk').text()).toContain('Output schema')
    expect(w.find('[aria-label="Input schema for Search"]').text()).toContain('query')
    expect(w.find('[aria-label="Output schema for Search"]').text()).toContain('results')
    w.unmount()
  })

  it('teaches the canonical registry-id tool call in the editor', async () => {
    const w = mount(CodeBody)
    await flushPromises()
    const placeholder = w.get('textarea.ce-code').attributes('placeholder')
    expect(placeholder).toContain('sdk.tools["namespace:tool_id"]')
    expect(placeholder).not.toContain('sdk.tools.search')
    expect(w.text()).toContain('this Block runs')
    w.unmount()
  })

  it('uses config as the only tool selection owner', async () => {
    ;(globalThis as any).__props__ = {
      config: { code: 'return true', tool_ids: ['kickside.tools:search'] },
      meta: { tool_ids: ['ignored:legacy'] },
    }
    const w = mount(CodeBody)
    await flushPromises()
    const picker = w.find('wc-multiselect')
    expect(picker.attributes()).toMatchObject({
      source: '/api/v1/code-execution/sdk-reference',
      'response-key': 'tools',
      'id-key': 'id',
      'label-key': 'label',
      selected: '["kickside.tools:search"]',
    })
    w.unmount()
  })

  it('emits a picker selection and omits tool_ids again when cleared', async () => {
    const w = mount(CodeBody)
    await flushPromises()
    const picker = w.find('wc-multiselect')
    picker.element.dispatchEvent(new CustomEvent('change', { detail: { selected: ['kickside.tools:search'] } }))
    await flushPromises()
    expect(lastEmit('config-changed')[1]).toEqual({ code: '', tool_ids: ['kickside.tools:search'] })

    picker.element.dispatchEvent(new CustomEvent('change', { detail: { selected: [] } }))
    await flushPromises()
    expect(lastEmit('config-changed')[1]).toEqual({ code: '' })
    w.unmount()
  })

  it('does not mutate Block config when mounted', async () => {
    ;(globalThis as any).__props__ = { config: { code: 'return 7', tool_ids: ['kickside.tools:search'] } }
    const w = mount(CodeBody)
    await flushPromises()
    expect(emitSpy().mock.calls.filter((c: any[]) => c[0] === 'config-changed')).toEqual([])
    w.unmount()
  })
})

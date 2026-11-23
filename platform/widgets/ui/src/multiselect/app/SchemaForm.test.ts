// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { webComponent } from '../schema_form'

vi.mock('@wippy-fe/proxy', () => ({
  addIcons: vi.fn(), applyThemeMode: vi.fn(), define: vi.fn(),
  config: {}, host: {}, on: () => () => {}, hostCss: {}, loadCss: vi.fn(), loadByTagName: vi.fn(),
}))
Object.defineProperty(HTMLElement.prototype, 'attachInternals', {
  configurable: true, value: () => ({ states: new Set() }),
})

const SchemaFormElement = await webComponent()
customElements.define('test-schema-form', SchemaFormElement)
customElements.define('test-schema-picker', class extends HTMLElement {
  constructor() {
    super()
    const button = document.createElement('button')
    button.textContent = 'Pick'
    this.attachShadow({ mode: 'open' }).append(button)
  }
})

async function mount(
  properties: Record<string, Record<string, unknown>>,
  config: Record<string, unknown> = {},
  attrs: Record<string, string> = {},
  required: string[] = [],
) {
  const element = new SchemaFormElement()
  element.setAttribute('schema', JSON.stringify({ properties, required }))
  element.setAttribute('config', JSON.stringify(config))
  for (const [name, value] of Object.entries(attrs)) element.setAttribute(name, value)
  const validity = vi.fn()
  const changed = vi.fn()
  element.addEventListener('validity-changed', event => validity((event as CustomEvent).detail))
  element.addEventListener('config-changed', event => changed((event as CustomEvent).detail))
  document.body.append(element)
  await vi.waitFor(() => expect(element.shadowRoot?.querySelector('.sf-field')).toBeTruthy())
  const root = element.shadowRoot!
  const fields = () => [...root.querySelectorAll('.sf-field')]
  const control = (index = 0) => fields()[index]!.querySelector<HTMLInputElement>('input, textarea, select, test-schema-picker')!
  return { element, root, fields, control, validity, changed }
}

async function input(control: HTMLInputElement, value: string) {
  control.value = value
  control.dispatchEvent(new Event('input', { bubbles: true }))
  await nextTick()
}

afterEach(() => document.body.replaceChildren())

describe('schema form field validation', () => {
  it('associates independent names, help and field errors with every rendered control', async () => {
    const { root, fields, control, validity } = await mount({
      text: { type: 'string' }, password: { format: 'password' }, date: { format: 'date' },
      notes: { format: 'textarea' }, number: { type: 'number' }, integer: { type: 'integer' },
      option: { enum: ['one'] }, flag: { type: 'boolean' }, object: { type: 'object' },
      array: { type: 'array' }, picker: { picker: 'test-schema-picker' },
    })
    const keys = ['text', 'password', 'date', 'notes', 'number', 'integer', 'option', 'flag', 'object', 'array', 'picker']
    const properties = Object.fromEntries(keys.map(key => [key, {
      ...JSON.parse(root.host.getAttribute('schema')!).properties[key], description: 'Help for ' + key,
    }]))
    root.host.setAttribute('schema', JSON.stringify({ properties }))
    root.host.setAttribute('field-errors', JSON.stringify(Object.fromEntries(keys.map(key => [key, key + ' refused']))))
    await nextTick()
    keys.forEach((key, index) => {
      const field = fields()[index]!
      const node = control(index)
      const label = field.querySelector('.sf-lbl')!
      if (node.localName === 'test-schema-picker') expect(node.getAttribute('aria-labelledby')).toBe(label.id)
      else expect(label.getAttribute('for')).toBe(node.id)
      const ids = node.getAttribute('aria-describedby')!.split(' ')
      expect(ids.map(id => root.getElementById(id)?.textContent)).toEqual(['Help for ' + key, key + ' refused'])
      expect(node.getAttribute('aria-invalid')).toBe('true')
      expect(field.querySelector('.sf-error')?.textContent).toBe(key + ' refused')
    })
    expect(validity).toHaveBeenLastCalledWith({ valid: false, errors: Object.fromEntries(keys.map(key => [key, key + ' refused'])) })
  })

  it('reports bad drafts without replacing structured values and clears errors after correction', async () => {
    const { element, control, changed, validity } = await mount(
      { count: { type: 'integer', minimum: 2, maximum: 5 }, rules: { type: 'object' }, items: { type: 'array' } },
      { count: 3, rules: { ready: true }, items: [] },
    )
    expect(validity).toHaveBeenLastCalledWith({ valid: true, errors: {} })
    await input(control(0), '1.5')
    await input(control(1), '{')
    await input(control(2), '{}')
    expect(changed).toHaveBeenCalledTimes(1)
    expect(validity).toHaveBeenLastCalledWith({ valid: false, errors: {
      count: 'Enter a whole number.',
      rules: 'That isn’t valid JSON. Check commas, quotes, and brackets.',
      items: 'Enter a JSON array.',
    } })
    element.setAttribute('config', JSON.stringify(changed.mock.lastCall![0]))
    await nextTick()
    expect(control(1).value).toBe('{')
    await input(control(0), '6')
    expect(validity.mock.lastCall![0].errors.count).toBe('Enter at most 5.')
    await input(control(0), '3')
    await input(control(1), '{ "ready": true }')
    await input(control(2), '[]')
    expect(validity).toHaveBeenLastCalledWith({ valid: true, errors: {} })
    expect(control(1).hasAttribute('aria-invalid')).toBe(false)
    expect(control(1).value).toBe('{ "ready": true }')
  })

  it('reports native bad input and focuses the first invalid control in rendered order on submit', async () => {
    const { element, root, control, validity } = await mount({
      advanced: { type: 'string', group: 'advanced', minLength: 3 },
      number: { type: 'number' },
    }, { advanced: 'x' })
    const number = control()
    const nativeValidity = number.validity
    Object.defineProperty(number, 'validity', { configurable: true, value: { badInput: true } })
    await input(number, '')
    expect(validity.mock.lastCall![0].errors.number).toBe('Enter a number.')
    expect(element.reportValidity()).toBe(false)
    expect(root.activeElement).toBe(number)
    Object.defineProperty(number, 'validity', { value: nativeValidity })
    await input(number, '2')
    root.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }))
    await nextTick()
    expect(root.querySelector('details')!.open).toBe(true)
    expect(root.activeElement).toBe(control(1))
  })

  it('keeps nested picker controls in the tab order and focuses the picker control on submit', async () => {
    const { element, control } = await mount(
      { owner: { picker: 'test-schema-picker', required: true } },
    )
    const picker = control()
    expect(picker.getAttribute('tabindex')).toBeNull()
    expect(element.reportValidity()).toBe(false)
    expect(picker.shadowRoot!.activeElement).toBe(picker.shadowRoot!.querySelector('button'))
  })

  it('allows unset deployment overrides and records explicit false as a value', async () => {
    const { element, control, validity, changed } = await mount({
      name: { type: 'string', required: true, minLength: 2 },
      flag: { type: 'boolean', default: true },
    }, {}, { 'allow-unset': '' }, ['flag'])
    expect(validity).toHaveBeenLastCalledWith({ valid: true, errors: {} })
    expect(element.reportValidity()).toBe(true)
    const toggle = control(1)
    toggle.checked = false
    toggle.dispatchEvent(new Event('change'))
    await nextTick()
    expect(changed).toHaveBeenLastCalledWith({ flag: false })
    await input(control(), 'x')
    expect(validity).toHaveBeenLastCalledWith({ valid: false, errors: { name: 'Enter at least 2 characters.' } })
    await input(control(), '')
    expect(validity).toHaveBeenLastCalledWith({ valid: true, errors: {} })
  })
})

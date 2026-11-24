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

  it('edits a text list as chips and validates each entry against the item schema', async () => {
    const { root, control, changed, validity } = await mount({
      attributes: { type: 'array', title: 'Attributes', items: { type: 'string', pattern: '^[a-z_]+$' }, uniqueItems: true },
    }, { attributes: ['brand'] })
    const entry = control()
    expect(root.querySelector('label.sf-lbl')!.getAttribute('for')).toBe(entry.id)
    expect(root.querySelectorAll('#' + CSS.escape(entry.id))).toHaveLength(1)
    expect([...root.querySelectorAll('.sf-list-chip-label')].map(chip => chip.textContent)).toEqual(['brand'])
    await input(entry, 'Color')
    entry.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    await nextTick()
    expect(changed).toHaveBeenLastCalledWith({ attributes: ['brand', 'Color'] })
    expect(validity).toHaveBeenLastCalledWith({ valid: false, errors: { attributes: 'Entry 2: Use the required format.' } })
    root.querySelector<HTMLButtonElement>('button[aria-label="Remove Color"]')!.click()
    await nextTick()
    expect(changed).toHaveBeenLastCalledWith({ attributes: ['brand'] })
    expect(validity).toHaveBeenLastCalledWith({ valid: true, errors: {} })
  })

  it('offers enumerated list items as a labelled group of choices', async () => {
    const { root, changed } = await mount({ days: { type: 'array', title: 'Days', items: { type: 'string', enum: ['mon', 'tue', 'wed'] } } }, { days: ['wed'] })
    const group = root.querySelector<HTMLElement>('[role="group"].sf-options')!
    expect(root.getElementById(group.getAttribute('aria-labelledby')!)!.textContent!.trim()).toBe('Days')
    const boxes = [...group.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')]
    expect(boxes.map(box => box.checked)).toEqual([false, false, true])
    boxes[0]!.checked = true
    boxes[0]!.dispatchEvent(new Event('change'))
    await nextTick()
    expect(changed).toHaveBeenLastCalledWith({ days: ['mon', 'wed'] })
  })

  it('offers a host-supplied choice set for x-choices, limited to the values the item schema admits', async () => {
    const choices = { board_item_types: [{ value: 'task', label: 'Task' }, { value: 'issue', label: 'Issue' }, { value: 'support', label: 'Support request' }] }
    const { root, changed, validity } = await mount({
      types: { type: 'array', title: 'Types', items: { type: 'string', 'x-choices': 'board_item_types', not: { enum: ['issue'] } } },
    }, { types: ['support'] }, { choices: JSON.stringify(choices) })
    const group = root.querySelector<HTMLElement>('[role="group"].sf-options')!
    expect([...group.querySelectorAll('.sf-option')].map(option => option.textContent!.trim())).toEqual(['Task', 'Support request'])
    const boxes = [...group.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')]
    expect(boxes.map(box => box.checked)).toEqual([false, true])
    boxes[0]!.checked = true
    boxes[0]!.dispatchEvent(new Event('change'))
    await nextTick()
    expect(changed).toHaveBeenLastCalledWith({ types: ['task', 'support'] })
    expect(validity).toHaveBeenLastCalledWith({ valid: true, errors: {} })
    root.host.setAttribute('config', JSON.stringify({ types: ['issue', 'gone'] }))
    await nextTick()
    expect(validity).toHaveBeenLastCalledWith({ valid: false, errors: { types: 'Entry 1: Choose a different value.' } })
  })

  it('labels a single x-choices value and says when the host supplies no choices', async () => {
    const { root, control, changed } = await mount({
      owner: { type: 'string', title: 'Owner type', 'x-choices': 'board_item_types' },
      types: { type: 'array', title: 'Types', items: { type: 'string', 'x-choices': 'missing_set' } },
    }, {}, { choices: JSON.stringify({ board_item_types: [{ value: 'task', label: 'Task' }, { value: 'bug' }] }) })
    const select = control() as unknown as HTMLSelectElement
    expect([...select.options].map(option => option.textContent)).toEqual(['Choose a value', 'Task', 'bug'])
    select.selectedIndex = 1
    select.dispatchEvent(new Event('change'))
    await nextTick()
    expect(changed).toHaveBeenLastCalledWith({ owner: 'task' })
    const group = root.querySelector<HTMLElement>('[role="group"].sf-options')!
    expect(group.querySelectorAll('input').length).toBe(0)
    expect(group.textContent!.trim()).toBe('No choices are available.')
  })

  it('disables every control while the host marks the form disabled', async () => {
    const { root, element } = await mount({
      name: { type: 'string' }, owner: { picker: 'test-schema-picker' },
    }, {}, { disabled: '' })
    const body = root.querySelector<HTMLFieldSetElement>('fieldset.sf-body')!
    expect(body.disabled).toBe(true)
    expect(body.contains(root.querySelector('input'))).toBe(true)
    expect(root.querySelector('test-schema-picker')!.hasAttribute('inert')).toBe(true)
    element.setAttribute('disabled', 'false')
    await nextTick()
    expect(body.disabled).toBe(false)
    expect(root.querySelector('test-schema-picker')!.hasAttribute('inert')).toBe(false)
  })

  it('renders booleans as switches, named groups under a legend and explains unset defaults', async () => {
    const { root, control } = await mount({
      enabled: { type: 'boolean', title: 'Enabled', default: true },
      hold: { type: 'integer', title: 'Hold', group: 'Reservations' },
      note: { type: 'string', title: 'Note', group: 'Reservations', default: 'none' },
    }, {}, { 'allow-unset': '' })
    expect(control().getAttribute('role')).toBe('switch')
    expect(control().checked).toBe(true)
    const legend = root.querySelector('fieldset.sf-group > legend')!
    expect(legend.textContent).toBe('Reservations')
    expect([...legend.parentElement!.querySelectorAll('.sf-lbl')].map(label => label.textContent!.trim())).toEqual(['Hold', 'Note'])
    const hints = (index: number) => control(index).getAttribute('aria-describedby')!.split(' ').map(id => root.getElementById(id)!.textContent)
    expect(hints(0)).toEqual(['Default: On'])
    expect(hints(1)).toEqual(['Uses the application setting.'])
    expect(hints(2)).toEqual(['Default: none'])
  })
})

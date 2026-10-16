import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import vm from 'node:vm'
import { Window } from 'happy-dom'

const source = await readFile(new URL('../../static/settings-card.js', import.meta.url), 'utf8')
async function card(api = {}) {
  const window = new Window()
  const context = vm.createContext({ document: window.document, HTMLElement: window.HTMLElement, customElements: window.customElements, CustomEvent: window.CustomEvent })
  const proxy = new vm.SyntheticModule(['api', 'loadByTagName'], function () {
    this.setExport('api', api)
    this.setExport('loadByTagName', async () => {})
  }, { context })
  const module = new vm.SourceTextModule(source, { context })
  await module.link(() => proxy)
  await module.evaluate()
  const element = window.document.createElement('kickside-webscout-settings')
  element.render()
  return { element, window }
}
const providers = [{ id: 'google', label: '<Google>', configured: true, description: 'Public web' }]
test('shows a removed saved provider and allows replacing it with the installed default', async () => {
  const { element, window } = await card()
  element.fill(providers, 'google', 'removed')
  const select = element.querySelector('[data-select]')
  assert.equal(select.value, 'removed')
  assert.equal(select.options[0].disabled, true)
  assert.equal(select.options[1].value, 'google')
  assert.match(element.querySelector('[data-notice]').textContent, /not installed/)
  assert.equal(element.querySelector('[data-states] Google'), null)
  await window.happyDOM.close()
})
test('saves the canonical namespace and emits a change only after server acceptance', async () => {
  const calls = []; const { element, window } = await card({ put: async (...args) => { calls.push(args); return { data: { success: true } } } })
  element.load = async () => {}
  let events = 0; element.addEventListener('config-changed', () => events++)
  await element.save('google')
  assert.deepEqual(JSON.parse(JSON.stringify(calls[0])),  ['/api/v1/settings', { namespace: 'kickside.webscout', key: 'search_provider', value: 'google' }])
  assert.equal(events, 1)
  await window.happyDOM.close()
})
test('preserves rejected saves without emitting a change', async () => {
  const { element, window } = await card({ put: async () => ({ data: { success: false, error: 'provider is not installed' } }) })
  let events = 0; element.addEventListener('config-changed', () => events++)
  await element.save('removed')
  assert.equal(events, 0)
  assert.equal(element.querySelector('[data-state]').textContent, 'not saved')
  assert.match(element.querySelector('[data-hint]').textContent, /not installed/)
  await window.happyDOM.close()
})
test('reports transport failure instead of displaying a successful load', async () => {
  const { element, window } = await card({ get: async () => { throw new Error('offline') } })
  await element.load()
  assert.equal(element.querySelector('[data-state]').textContent, 'unavailable')
  assert.match(element.querySelector('[data-hint]').textContent, /offline/)
  await window.happyDOM.close()
})

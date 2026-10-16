import { describe, expect, it, vi } from 'vitest'
vi.mock('./app/GraphApp.vue', () => ({ default: {} }))
vi.mock('@wippy-fe/webcomponent-vue', () => ({ WippyVueElement: class {}, define: vi.fn() }))
import { webComponent } from './index'
describe('renderer access contract', () => {
  it('parses read-only as a boolean at the public web component boundary', async () => {
    const element = await webComponent()
    expect(element.wippyConfig.propsSchema.properties['read-only']).toEqual({ type: 'boolean', default: false, description: 'Disables editing while retaining full reading and inspection controls.' })
  })
})

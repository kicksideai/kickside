// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { describe, expect, it, vi } from 'vitest'
import { parseProps } from '@wippy-fe/webcomponent-core'
vi.mock('@wippy-fe/webcomponent-vue', async importOriginal => ({
  ...await importOriginal<Record<string, unknown>>(), define: vi.fn(),
}))
import { webComponent } from './master_picker'

describe('capability configuration component props', () => {
  it('delivers the declared context schema through the element attribute parser', async () => {
    const Element = await webComponent()
    const element = document.createElement('div')
    const schema = { type: 'object', properties: { namespaces: { type: 'array' } }, additionalProperties: false }
    element.setAttribute('config', JSON.stringify({ namespaces: [] }))
    element.setAttribute('schema', JSON.stringify(schema))
    const parsed = parseProps(element, Element.wippyConfig.propsSchema)
    expect(parsed.errors).toEqual([])
    expect(parsed.props.schema).toEqual(schema)
    expect(parsed.props.config).toEqual({ namespaces: [] })
    element.removeAttribute('schema')
    expect(parseProps(element, Element.wippyConfig.propsSchema).errors).toEqual([])
  })
})

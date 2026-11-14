import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as XLSX from 'xlsx'
import { api } from '@wippy-fe/proxy'
import RenderMarkdown from './RenderMarkdown.vue'
import RenderXlsx from './RenderXlsx.vue'

const rows = Array.from({ length: 101 }, (_, row) =>
  Array.from({ length: 41 }, (_, col) => `cell-${row}-${col}`))
const markdown = [rows[0].join(' | '), rows[0].map(() => '---').join(' | '),
  ...rows.slice(1).map(row => row.join(' | '))].join('\n')

describe('bounded previews preserve every row and column', () => {
  beforeEach(() => vi.mocked(api.get).mockReset())

  it('pages extracted spreadsheet tables and reaches the last cell', async () => {
    ;(globalThis as unknown as { __props__: object }).__props__ = { source: markdown }
    const view = mount(RenderMarkdown)
    await flushPromises()
    expect(view.findAll('td,th').length).toBeLessThanOrEqual(520)
    expect(view.text()).toContain('100')
    await view.get('input[aria-label="Table 1 row page"]').setValue('4')
    await flushPromises()
    await view.get('input[aria-label="Table 1 column page"]').setValue('3')
    await flushPromises()
    expect(view.text()).toContain('cell-100-40')
    expect(view.text()).not.toContain('cell-1-0')
    view.unmount()
  })

  it('pages a workbook and reaches its last cell without creating the entire DOM', async () => {
    ;(globalThis as unknown as { __props__: object }).__props__ = { sourceUrl: '/catalog.xlsx' }
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Catalog')
    vi.mocked(api.get).mockResolvedValue({ data: XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) })
    const view = mount(RenderXlsx)
    await flushPromises()
    expect(view.findAll('td').length).toBeLessThanOrEqual(500)
    await view.get('input[aria-label="Catalog row page"]').setValue('5')
    await flushPromises()
    await view.get('input[aria-label="Catalog column page"]').setValue('3')
    await flushPromises()
    expect(view.text()).toContain('cell-100-40')
    view.unmount()
  })
})

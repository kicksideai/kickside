import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as XLSX from 'xlsx'
import { api } from '@wippy-fe/proxy'
import RenderXlsx from './RenderXlsx.vue'

describe('RenderXlsx workbook trust boundary', () => {
  beforeEach(() => {
    ;(globalThis as any).__props__ = { sourceUrl: '/untrusted.xlsx' }
    vi.mocked(api.get).mockReset()
  })

  it('renders workbook hyperlinks as text instead of executable HTML', async () => {
    const sheet = XLSX.utils.aoa_to_sheet([['Open report']])
    sheet.A1.l = { Target: 'javascript:alert(document.domain)' }
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, sheet, 'Sheet1')
    const bytes = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })
    vi.mocked(api.get).mockResolvedValue({ data: bytes })

    const wrapper = mount(RenderXlsx)
    await flushPromises()

    expect(wrapper.get('.xlsxv-sheet').text()).toContain('Open report')
    expect(wrapper.find('.xlsxv-sheet a').exists()).toBe(false)
    expect(wrapper.html()).not.toContain('javascript:')
    wrapper.unmount()
  })
})

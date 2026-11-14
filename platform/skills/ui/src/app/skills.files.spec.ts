import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import Skills from './skills.vue'

const path = 'references/dispatch & returns.md'
const content = 'Dispatch returns within 17 days.'
const skill = { skill_id: 's1', name: 'Dispatch', version: 3, body: 'Use the reference', files: [{ path, kind: 'reference' }] }

async function open() {
  const wrapper = mount(Skills, { global: { stubs: { Dialog: { template: '<div v-if="visible" role="dialog"><slot /><slot name="footer" /></div>', props: ['visible'] } } } })
  await flushPromises()
  await wrapper.get('[aria-label="Open Dispatch"]').trigger('click')
  await flushPromises()
  return wrapper
}

beforeEach(() => {
  vi.mocked(api.get).mockReset()
  vi.mocked(api.get).mockImplementation(async (url: string) => {
    if (url === '/api/v1/skills?limit=100') return { data: { success: true, skills: [skill] } } as any
    if (url === '/api/v1/skills/s1') return { data: { success: true, skill } } as any
    if (url === '/api/v1/skills/s1/versions') return { data: { success: true, versions: [] } } as any
    return { data: { success: true, file: { path, encoding: 'base64', mime_type: 'text/markdown', content: btoa(content) } } } as any
  })
})

afterEach(() => vi.restoreAllMocks())

describe('bundled skill files', () => {
  it('reads and displays a file from the loaded skill version', async () => {
    const wrapper = await open()
    await wrapper.get('.kx-file-path').trigger('click')
    await flushPromises()
    expect(api.get).toHaveBeenCalledWith('/api/v1/skills/s1/file?path=references%2Fdispatch%20%26%20returns.md&version=3&format=base64')
    expect(wrapper.text()).toContain(content)
  })

  it('downloads the original bytes and releases the object URL', async () => {
    const create = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:skill')
    const revoke = vi.spyOn(URL, 'revokeObjectURL')
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const wrapper = await open()
    await wrapper.get('button[aria-label="Download ' + path + '"]').trigger('click')
    await flushPromises()
    expect(await (create.mock.calls[0][0] as Blob).text()).toBe(content)
    expect((click.mock.instances[0] as HTMLAnchorElement).download).toBe('dispatch & returns.md')
    expect(revoke).toHaveBeenCalledWith('blob:skill')
    vi.restoreAllMocks()
  })

  it('downloads binary assets without changing their bytes', async () => {
    const create = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:skill')
    vi.spyOn(URL, 'revokeObjectURL')
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const wrapper = await open()
    vi.mocked(api.get).mockResolvedValueOnce({ data: { success: true,
      file: { path, encoding: 'base64', mime_type: 'application/octet-stream', content: 'AP8=' },
    } } as any)
    await wrapper.get('button[aria-label="Download ' + path + '"]').trigger('click')
    await flushPromises()
    const bytes = await (create.mock.calls[0][0] as Blob).arrayBuffer()
    expect(Array.from(new Uint8Array(bytes))).toEqual([0, 255])
  })

  it('shows a failed read without displaying stale file content', async () => {
    const wrapper = await open()
    await wrapper.get('.kx-file-path').trigger('click')
    await flushPromises()
    vi.mocked(api.get).mockRejectedValueOnce(new Error('file access denied'))
    await wrapper.get('.kx-file-path').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('file access denied')
    expect(wrapper.text()).not.toContain(content)
  })
})

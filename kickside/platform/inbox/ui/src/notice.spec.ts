import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadByTagName } from '@wippy-fe/proxy'
import { webComponent } from './notice'

vi.mock('@wippy-fe/webcomponent-core', () => ({
  WippyElement: class {},
  define: vi.fn(),
}))

const content = '## What changed\n\n**Discount update**\n- Review the terms.\n- Confirm the date.\n\n<img src=x onerror="alert(1)"><script>alert(1)</script>\n[unsafe](javascript:alert(1))'
const hosts: HTMLElement[] = []

afterEach(() => {
  for (const host of hosts.splice(0)) host.remove()
  vi.mocked(loadByTagName).mockClear()
})

async function mountNotice(source = content) {
  const Notice = await webComponent()
  const notice = new Notice()
  const host = document.createElement('div')
  hosts.push(host)
  document.body.appendChild(host)
  const shadow = host.attachShadow({ mode: 'open' })
  const container = document.createElement('div')
  shadow.appendChild(container)
  const dataMeta = JSON.stringify({ fields: [{ label: 'Terms <img src=x>', value: '"Annual" & <script>alert(2)</script>' }] })
  Reflect.get(notice, 'onMount').call(notice, shadow, container, { content: source, dataMeta })
  return { notice, container, dataMeta }
}

describe('notice content renderer', () => {
  it('passes headings, bold, lists and untrusted HTML unchanged to the shared Markdown renderer', async () => {
    const { container } = await mountNotice()
    expect(loadByTagName).toHaveBeenCalledWith('wc-render-markdown', { timeoutMs: 8000 })
    const renderer = container.querySelector('wc-render-markdown')
    expect(renderer).not.toBeNull()
    expect(renderer!.getAttribute('source')).toBe(content)
    expect(container.querySelector('img, script, [onerror]')).toBeNull()
  })

  it('keeps metadata fields escaped beside the Markdown body', async () => {
    const { container } = await mountNotice()
    expect(container.querySelector('.label')?.textContent).toBe('Terms <img src=x>')
    expect(container.querySelector('.value')?.textContent).toBe('"Annual" & <script>alert(2)</script>')
    expect(container.querySelector('img, script, [onerror]')).toBeNull()
  })

  it('forwards updated content and retains metadata fields', async () => {
    const { notice, container, dataMeta } = await mountNotice('Plain text')
    const updated = '# Updated\n\n**Read this**\n\n- First\n- Second'
    Reflect.get(notice, 'onPropsChanged').call(notice, { content: updated, dataMeta })
    expect(container.querySelector('wc-render-markdown')?.getAttribute('source')).toBe(updated)
    expect(container.querySelectorAll('.field')).toHaveLength(1)
  })

  it('renders metadata without creating an empty Markdown body', async () => {
    const { container } = await mountNotice('')
    expect(container.querySelector('wc-render-markdown')).toBeNull()
    expect(container.querySelectorAll('.field')).toHaveLength(1)
  })
})

import { vi } from 'vitest'
import { config } from '@vue/test-utils'

vi.mock('@wippy-fe/proxy', () => ({
  api: {
    get: vi.fn(() => Promise.resolve({ data: { success: true, items: [] } })),
    post: vi.fn(() => Promise.resolve({ data: { success: true } })),
  },
  loadByTagName: vi.fn(() => Promise.resolve()),
  on: vi.fn(() => vi.fn()),
}))

vi.mock('@iconify/vue', () => ({ Icon: { name: 'Icon', render: () => null } }))

config.global.config = config.global.config || {}
config.global.config.compilerOptions = { isCustomElement: (tag: string) => tag.startsWith('wc-') }
